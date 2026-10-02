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

@Injectable()
export class IdentityCacheService {
  private readonly logger = new Logger(IdentityCacheService.name);
  private redisClient: Redis | null = null;
  private memoryFallback = new Map<string, { value: string; expiresAt: number }>();
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

  async invalidateRecord(orgId: string, env: string, service: string, identifier: string): Promise<void> {
    const key = this.generateKey(orgId, env, service, identifier);
    this.memoryFallback.delete(key);
    if (this.redisAvailable && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch {}
    }
  }
}
