import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  InternalServerErrorException,
  UseInterceptors,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MockProvider } from './providers/mock.provider';
import { DojahProvider } from './providers/dojah.provider';
import { BillingService } from '../billing/billing.service';
import { IdentityCacheService } from './identity-cache.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationLog, VerificationStatus } from './entities/verification-log.entity';
import { v4 as uuidv4 } from 'uuid';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';
import { Environment } from '../organizations/entities/environment-config.entity';

@Controller('v1/verify')
export class VerificationsController {
  constructor(
    private mockProvider: MockProvider,
    private dojahProvider: DojahProvider,
    private billingService: BillingService,
    private identityCacheService: IdentityCacheService,
    @InjectRepository(VerificationLog)
    private logRepository: Repository<VerificationLog>,
  ) {}

  // --- API Key Authenticated Endpoints (For Developers & SDKs) ---

  @UseGuards(ApiKeyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Post('bvn')
  async verifyBvn(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const identifier = String(body.bvn || '').trim();
    const isLive = req.environment === Environment.LIVE;
    return this.processVerification(
      req,
      'bvn',
      identifier,
      body,
      () => (isLive ? this.dojahProvider.verifyBvn(body) : this.mockProvider.verifyBvn(body))
    );
  }

  @UseGuards(ApiKeyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Post('nin')
  async verifyNin(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const identifier = String(body.nin || '').trim();
    const isLive = req.environment === Environment.LIVE;
    return this.processVerification(
      req,
      'nin',
      identifier,
      body,
      () => (isLive ? this.dojahProvider.verifyNin(body) : this.mockProvider.verifyNin(body))
    );
  }

  @UseGuards(ApiKeyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Post('bank-account')
  async verifyBankAccount(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const identifier = `${body.bankCode || ''}_${body.accountNumber || ''}`.trim();
    const isLive = req.environment === Environment.LIVE;
    return this.processVerification(
      req,
      'nuban',
      identifier,
      body,
      () => (isLive ? this.dojahProvider.verifyBankAccount(body) : this.mockProvider.verifyBankAccount(body))
    );
  }

  // --- JWT Authenticated Endpoints (For Customer Dashboard) ---

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async getLogs(
    @Req() req: any,
    @Query('service') service?: string,
    @Query('status') status?: string,
    @Query('source') source?: string, // 'all' | 'live' | 'cache'
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .where('log.org_id = :orgId', { orgId: req.organizationId })
      .orderBy('log.createdAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    if (service && service !== 'all') {
      queryBuilder.andWhere('log.serviceType = :service', { service: service.toLowerCase() });
    }
    if (status && status !== 'all') {
      const dbStatus = status.toLowerCase() === 'verified' || status.toLowerCase() === 'success'
        ? VerificationStatus.SUCCESS
        : VerificationStatus.FAILED;
      queryBuilder.andWhere('log.status = :status', { status: dbStatus });
    }
    if (source && source !== 'all') {
      if (source.toLowerCase() === 'cache') {
        queryBuilder.andWhere('log.isCached = :isCached', { isCached: true });
      } else if (source.toLowerCase() === 'live') {
        queryBuilder.andWhere('log.isCached = :isCached', { isCached: false });
      }
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items: items.map((log) => ({
        id: log.id,
        service: log.serviceType.toUpperCase(),
        status: log.status === VerificationStatus.SUCCESS ? 'Verified' : 'Failed',
        environment: log.environment,
        provider: log.upstreamProvider,
        isCached: log.isCached ?? false,
        source: log.source || (log.isCached ? 'CACHE' : 'LIVE'),
        costDeducted: log.costDeducted ? Number(log.costDeducted) : (log.isCached ? 20 : (log.serviceType === 'nuban' ? 10 : 50)),
        latencyMs: log.latencyMs || (log.isCached ? 14 : 142),
        idempotencyKey: log.idempotencyKey,
        createdAt: log.createdAt,
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs/:id')
  async getLogDetail(@Req() req: any, @Param('id') id: string) {
    const log = await this.logRepository.findOne({
      where: { id, org_id: req.organizationId },
    });
    if (!log) {
      throw new NotFoundException('Verification log not found');
    }
    return {
      id: log.id,
      service: log.serviceType.toUpperCase(),
      status: log.status,
      environment: log.environment,
      provider: log.upstreamProvider,
      isCached: log.isCached ?? false,
      source: log.source || (log.isCached ? 'CACHE' : 'LIVE'),
      costDeducted: log.costDeducted ? Number(log.costDeducted) : (log.isCached ? 20 : (log.serviceType === 'nuban' ? 10 : 50)),
      latencyMs: log.latencyMs || (log.isCached ? 14 : 142),
      cacheKey: log.cacheKey,
      idempotencyKey: log.idempotencyKey,
      createdAt: log.createdAt,
      metadata: {
        latency_ms: log.latencyMs || (log.isCached ? 14 : 142),
        cost_ngx: log.costDeducted ? Number(log.costDeducted) : (log.isCached ? 20 : (log.serviceType === 'nuban' ? 10 : 50)),
        billing_status: 'deducted',
        is_cached: log.isCached ?? false,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  async getMetrics(@Req() req: any) {
    const orgId = req.organizationId;
    const total = await this.logRepository.count({ where: { org_id: orgId } });
    const successCount = await this.logRepository.count({
      where: { org_id: orgId, status: VerificationStatus.SUCCESS },
    });
    const cachedCount = await this.logRepository.count({
      where: { org_id: orgId, isCached: true },
    });
    const liveCount = total - cachedCount;
    const cacheHitRatio = total > 0 ? ((cachedCount / total) * 100).toFixed(1) + '%' : '0.0%';
    const totalSavingsNgx = cachedCount * 30; // Approx 30 NGX discount per cache hit

    const bvnCount = await this.logRepository.count({ where: { org_id: orgId, serviceType: 'bvn' } });
    const ninCount = await this.logRepository.count({ where: { org_id: orgId, serviceType: 'nin' } });
    const nubanCount = await this.logRepository.count({ where: { org_id: orgId, serviceType: 'nuban' } });

    const bvnCached = await this.logRepository.count({ where: { org_id: orgId, serviceType: 'bvn', isCached: true } });
    const ninCached = await this.logRepository.count({ where: { org_id: orgId, serviceType: 'nin', isCached: true } });
    const nubanCached = await this.logRepository.count({ where: { org_id: orgId, serviceType: 'nuban', isCached: true } });

    const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) + '%' : '100%';

    return {
      totalRequests: total,
      liveRequests: liveCount,
      cacheRequests: cachedCount,
      cacheHitRatio,
      totalSavingsNgx,
      averageLiveLatency: '185ms',
      averageCacheLatency: '14ms',
      successRate,
      breakdown: {
        bvn: bvnCount,
        nin: ninCount,
        nuban: nubanCount,
        live: {
          bvn: bvnCount - bvnCached,
          nin: ninCount - ninCached,
          nuban: nubanCount - nubanCached,
        },
        cache: {
          bvn: bvnCached,
          nin: ninCached,
          nuban: nubanCached,
        },
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('manual')
  async manualVerify(
    @Req() req: any,
    @Body() body: { service: 'bvn' | 'nin' | 'nuban'; environment: Environment; payload: any }
  ) {
    if (body.payload?.consent !== true && body.payload?.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }

    const targetEnv = String(body.environment).toLowerCase() === 'live' ? Environment.LIVE : Environment.SANDBOX;
    let identifier = '';
    if (body.service === 'bvn') identifier = String(body.payload?.bvn || '').trim();
    else if (body.service === 'nin') identifier = String(body.payload?.nin || '').trim();
    else identifier = `${body.payload?.bankCode || ''}_${body.payload?.accountNumber || ''}`.trim();

    const mockReq = {
      organizationId: req.organizationId,
      environment: targetEnv,
      apiKeyId: 'manual_workspace',
      headers: {},
    };

    const isLive = targetEnv === Environment.LIVE;

    return this.processVerification(
      mockReq,
      body.service,
      identifier,
      body.payload,
      async () => {
        if (body.service === 'bvn') {
          return isLive ? this.dojahProvider.verifyBvn(body.payload) : this.mockProvider.verifyBvn(body.payload);
        }
        if (body.service === 'nin') {
          return isLive ? this.dojahProvider.verifyNin(body.payload) : this.mockProvider.verifyNin(body.payload);
        }
        return isLive ? this.dojahProvider.verifyBankAccount(body.payload) : this.mockProvider.verifyBankAccount(body.payload);
      }
    );
  }

  private async processVerification(
    req: any,
    serviceType: 'bvn' | 'nin' | 'nuban',
    identifier: string,
    payload: any,
    providerCall: () => Promise<any>
  ) {
    const startTime = Date.now();
    const bypassCache =
      req.headers['x-bypass-cache'] === 'true' ||
      req.headers['x-refresh-cache'] === 'true' ||
      payload?.bypassCache === true;

    // 1. Check Smart Identity Cache (if enabled & not bypassed)
    if (!bypassCache && identifier) {
      const cached = await this.identityCacheService.getCachedRecord(
        req.organizationId,
        req.environment,
        serviceType,
        identifier,
      );

      if (cached) {
        // Cache HIT!
        const cacheRate = await this.billingService.getEffectiveRate(req.organizationId, serviceType, true);
        const cost = cacheRate.effectiveRate;
        const reference = `vx_cache_${uuidv4().slice(0, 12)}`;

        // Deduct discounted cache fee atomically
        await this.billingService.deductCredits(req.organizationId, req.environment, cost, reference);

        const latencyMs = Math.max(11, Date.now() - startTime);

        // Audit Log entry with isCached = true
        await this.logRepository.save({
          org_id: req.organizationId,
          environment: req.environment,
          api_key_id: req.apiKeyId || 'sdk_key',
          serviceType,
          status: VerificationStatus.SUCCESS,
          upstreamProvider: 'verixa_smart_cache',
          isCached: true,
          source: 'CACHE',
          costDeducted: cost,
          latencyMs,
          cacheKey: this.identityCacheService.generateKey(req.organizationId, req.environment, serviceType, identifier),
          idempotencyKey: req.headers['idempotency-key'] || undefined,
          requestPayload: payload,
          responsePayload: cached.data,
        });

        return {
          status: 'success',
          data: cached.data,
          meta: {
            cached: true,
            cached_at: cached.cachedAt,
            provider: 'verixa_smart_cache',
            upstream_provider: cached.sourceProvider,
            referenceId: reference,
            cost_ngx: cost,
            latency_ms: latencyMs,
            environment: req.environment,
          },
        };
      }
    }

    // 2. Cache MISS: Live Upstream Registry Query (e.g. Dojah / NIMC / NIBSS)
    const liveRate = await this.billingService.getEffectiveRate(req.organizationId, serviceType, false);
    const cost = liveRate.effectiveRate;
    const reference = uuidv4();

    // Deduct standard live fee atomically
    await this.billingService.deductCredits(req.organizationId, req.environment, cost, reference);

    try {
      // Execute Upstream Provider Call
      const result = await providerCall();
      const latencyMs = Math.max(135, Date.now() - startTime);

      // If lookup succeeded and returned data, store into Smart Identity Cache
      if (result.status === 'success' && result.data && identifier) {
        await this.identityCacheService.setCachedRecord(
          req.organizationId,
          req.environment,
          serviceType,
          identifier,
          result.data,
          result.meta?.provider || 'dojah',
        );
      }

      // Log Live Request
      await this.logRepository.save({
        org_id: req.organizationId,
        environment: req.environment,
        api_key_id: req.apiKeyId || 'sdk_key',
        serviceType,
        status:
          result.status === 'success'
            ? VerificationStatus.SUCCESS
            : VerificationStatus.FAILED,
        upstreamProvider: result.meta?.provider || 'dojah',
        isCached: false,
        source: 'LIVE',
        costDeducted: cost,
        latencyMs,
        cacheKey: identifier ? this.identityCacheService.generateKey(req.organizationId, req.environment, serviceType, identifier) : undefined,
        idempotencyKey: req.headers['idempotency-key'] || undefined,
        requestPayload: payload,
        responsePayload: result.data || null,
      });

      return {
        ...result,
        meta: {
          ...result.meta,
          cached: false,
          referenceId: reference,
          cost_ngx: cost,
          latency_ms: latencyMs,
          environment: req.environment,
        },
      };
    } catch (error) {
      // Refund if upstream fails
      await this.billingService.refundCredits(req.organizationId, req.environment, cost, reference);
      throw new InternalServerErrorException('Upstream provider failed');
    }
  }
}
