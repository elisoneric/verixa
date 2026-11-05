import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { SystemConfig } from '../admin/entities/system-config.entity';

export interface CachedIdentityResponse {
  data: any;
  cachedAt: string;
  sourceProvider: string;
  service: string;
  ttlSeconds: number;
}

export interface NotFoundIdentityResponse {
  notFound: true;
  cachedAt: string;
  service: string;
  ttlSeconds: number;
}

/**
 * Validates national identity format before calling upstream providers.
 * If format is invalid, returns error message to reject immediately, protecting funds.
 */
export function validateNationalIdFormat(service: string, identifier: string): string | null {
  if (!identifier) return null;
  const clean = String(identifier).trim();
  const lower = String(service || '').toLowerCase();

  // If sandbox mock prefix, let mock handle
  if (clean.startsWith('sandbox_')) return null;

  // NIN formats: strictly 11 digits
  if (lower.startsWith('nin') && !clean.startsWith('mock_')) {
    if (!/^\d{11}$/.test(clean)) {
      return 'NIN must be exactly 11 numeric digits';
    }
  }

  // BVN formats: strictly 11 digits
  if (lower.startsWith('bvn') && !clean.startsWith('mock_')) {
    if (!/^\d{11}$/.test(clean)) {
      return 'BVN must be exactly 11 numeric digits';
    }
  }

  return null;
}

/**
 * Detects whether an upstream gateway error indicates a 404 / Record Not Found.
 */
export function isUpstreamNotFoundError(err: any): boolean {
  if (!err) return false;
  const status = err.response?.status || err.status || err.statusCode;
  if (status === 404) return true;

  const raw = (
    (typeof err.response?.data === 'string'
      ? err.response.data
      : JSON.stringify(err.response?.data || '')) +
    ' ' +
    (err.message || '')
  ).toLowerCase();

  return (
    raw.includes('404') ||
    raw.includes('not found') ||
    raw.includes('no record found') ||
    raw.includes('record does not exist') ||
    raw.includes('does not exist') ||
    raw.includes('does not match any record') ||
    raw.includes('no match found') ||
    raw.includes('invalid nin') ||
    raw.includes('invalid bvn')
  );
}

@Injectable()
export class IdentityCacheService {
  private readonly logger = new Logger(IdentityCacheService.name);
  private redisClient: Redis | null = null;
  private memoryFallback = new Map<string, { value: string; expiresAt: number }>();
  private inFlightRequests = new Map<string, Promise<any>>();
  private redisAvailable = false;

  constructor(
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
  ) {
    this.initRedis();
  }

  private initRedis() {
    try {
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (times > 3) {
            this.redisAvailable = false;
            return null; // Stop retrying immediately if Redis is down, use in-memory fallback
          }
          return Math.min(times * 100, 1000);
        },
      });

      this.redisClient.on('connect', () => {
        this.redisAvailable = true;
        this.logger.log('Redis connected for Smart Identity Cache.');
      });

      this.redisClient.on('error', (err) => {
        if (this.redisAvailable) {
          this.logger.warn(`Redis connection issue: ${err.message}. Using in-memory cache fallback.`);
        }
        this.redisAvailable = false;
      });
    } catch (e: any) {
      this.redisAvailable = false;
      this.logger.warn(`Redis init fallback: ${e.message}`);
    }
  }

  public generateKey(orgId: string, env: string, service: string, identifier: string): string {
    const cleanId = String(identifier || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanService = String(service || '').trim().toLowerCase();
    const cleanEnv = String(env || 'sandbox').trim().toLowerCase();
    return `vx_cache:${cleanEnv}:${orgId}:${cleanService}:${cleanId}`;
  }

  /**
   * Negative Cache Key: Globally scoped per service and identifier.
   * If an ID does not exist in the national registry (NIMC/NIBSS), it doesn't exist for ANY tenant.
   */
  public generateNotFoundKey(service: string, identifier: string): string {
    const cleanId = String(identifier || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanService = String(service || '').trim().toLowerCase();
    return `vx_cache:not_found:${cleanService}:${cleanId}`;
  }

  async isCacheEnabled(): Promise<boolean> {
    try {
      const cfg = await this.configRepository.findOne({ where: { key: 'SMART_CACHE_ENABLED' } });
      if (cfg && cfg.value === 'false') {
        return false;
      }
      return true; // Enabled by default
    } catch {
      return true;
    }
  }

  async getCacheTtlDays(): Promise<number> {
    try {
      const cfg = await this.configRepository.findOne({ where: { key: 'CACHE_TTL_DAYS' } });
      if (cfg && cfg.value) {
        const parsed = parseInt(cfg.value, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      return 30; // 30 days default
    } catch {
      return 30;
    }
  }

  async getCachedRecord(
    orgId: string,
    env: string,
    service: string,
    identifier: string,
  ): Promise<CachedIdentityResponse | null> {
    const enabled = await this.isCacheEnabled();
    if (!enabled) return null;

    const key = this.generateKey(orgId, env, service, identifier);

    // 1. Try Redis
    if (this.redisAvailable && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (err) {
        this.redisAvailable = false;
      }
    }

    // 2. Try In-Memory Fallback
    const mem = this.memoryFallback.get(key);
    if (mem) {
      if (Date.now() < mem.expiresAt) {
        return JSON.parse(mem.value);
      } else {
        this.memoryFallback.delete(key);
      }
    }

    return null;
  }

  async setCachedRecord(
    orgId: string,
    env: string,
    service: string,
    identifier: string,
    data: any,
    sourceProvider: string,
  ): Promise<void> {
    const enabled = await this.isCacheEnabled();
    if (!enabled) return;

    const ttlDays = await this.getCacheTtlDays();
    const ttlSeconds = ttlDays * 24 * 60 * 60;
    const key = this.generateKey(orgId, env, service, identifier);

    const payload: CachedIdentityResponse = {
      data,
      cachedAt: new Date().toISOString(),
      sourceProvider,
      service,
      ttlSeconds,
    };
    const raw = JSON.stringify(payload);

    // 1. Set in Redis
    if (this.redisAvailable && this.redisClient) {
      try {
        await this.redisClient.set(key, raw, 'EX', ttlSeconds);
      } catch {
        this.redisAvailable = false;
      }
    }

    // 2. Always set in memory fallback as resilient local cache
    this.memoryFallback.set(key, {
      value: raw,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Retrieves a negative cache record (Tombstone) if this identifier was previously returned as Not Found (404).
   */
  async getNotFoundRecord(service: string, identifier: string): Promise<NotFoundIdentityResponse | null> {
    const enabled = await this.isCacheEnabled();
    if (!enabled) return null;

    const key = this.generateNotFoundKey(service, identifier);

    // 1. Try Redis
    if (this.redisAvailable && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch {
        this.redisAvailable = false;
      }
    }

    // 2. Try Memory Fallback
    const mem = this.memoryFallback.get(key);
    if (mem) {
      if (Date.now() < mem.expiresAt) {
        return JSON.parse(mem.value);
      } else {
        this.memoryFallback.delete(key);
      }
    }

    return null;
  }

  /**
   * Saves a negative cache record (Tombstone) for an invalid / missing identifier for 7 days.
   * Completely halts duplicate ₦60 charges from Dojah!
   */
  async setNotFoundRecord(service: string, identifier: string, ttlDays = 7): Promise<void> {
    const enabled = await this.isCacheEnabled();
    if (!enabled) return;

    const ttlSeconds = ttlDays * 24 * 60 * 60;
    const key = this.generateNotFoundKey(service, identifier);

    const payload: NotFoundIdentityResponse = {
      notFound: true,
      cachedAt: new Date().toISOString(),
      service,
      ttlSeconds,
    };
    const raw = JSON.stringify(payload);

    if (this.redisAvailable && this.redisClient) {
      try {
        await this.redisClient.set(key, raw, 'EX', ttlSeconds);
      } catch {
        this.redisAvailable = false;
      }
    }

    this.memoryFallback.set(key, {
      value: raw,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    this.logger.log(`Negative cache tombstone set: [${service}:${identifier}] cached for ${ttlDays} days. Upstream Dojah cost is now locked at ₦0.`);
  }

  /**
   * Anti-stampede request deduplication.
   * If multiple concurrent queries hit within milliseconds for the exact same identifier,
   * they all share a single upstream Promise instead of firing duplicate billable calls to Dojah.
   */
  async deduplicateRequest<T>(dedupKey: string, runner: () => Promise<T>): Promise<T> {
    const existing = this.inFlightRequests.get(dedupKey);
    if (existing) {
      this.logger.log(`Anti-stampede deduplication: piggybacking existing in-flight request for [${dedupKey}]`);
      return existing as Promise<T>;
    }

    const promise = (async () => {
      try {
        return await runner();
      } finally {
        this.inFlightRequests.delete(dedupKey);
      }
    })();

    this.inFlightRequests.set(dedupKey, promise);
    return promise;
  }

  async invalidateRecord(orgId: string, env: string, service: string, identifier: string): Promise<void> {
    const key = this.generateKey(orgId, env, service, identifier);
    this.memoryFallback.delete(key);
    if (this.redisAvailable && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch {}
    }

    // Also clear negative cache if manually invalidated
    const notFoundKey = this.generateNotFoundKey(service, identifier);
    this.memoryFallback.delete(notFoundKey);
    if (this.redisAvailable && this.redisClient) {
      try {
        await this.redisClient.del(notFoundKey);
      } catch {}
    }
  }
}
