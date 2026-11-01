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
import { maskPii } from '../common/utils/pii-masker.util';
import { Environment, normalizeEnvironment } from '../organizations/entities/environment-config.entity';
import { encryptPayload, decryptPayload, sanitizeIdentityRetention } from '../common/utils/crypto.util';


@Controller(['v1/verify', 'api/v1/verify'])
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

  @UseGuards(ApiKeyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Post('phone')
  async verifyPhoneNumber(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const phone = String(body.phoneNumber || body.phone_number || '').trim();
    if (!phone) {
      throw new BadRequestException('Valid Nigerian phone number is required.');
    }
    const isLive = req.environment === Environment.LIVE;
    return this.processVerification(
      req,
      'phone',
      phone,
      body,
      () => (isLive ? this.dojahProvider.verifyPhoneNumber({ phoneNumber: phone, variant: body.variant }) : this.mockProvider.verifyPhoneNumber({ phoneNumber: phone, variant: body.variant }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Post('cac')
  async verifyCac(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const rc = String(body.rcNumber || body.rc_number || '').trim();
    if (!rc) {
      throw new BadRequestException('Company RC number is required.');
    }
    const isLive = req.environment === Environment.LIVE;
    return this.processVerification(
      req,
      'cac',
      rc,
      body,
      () => (isLive ? this.dojahProvider.verifyCac({ rcNumber: rc, companyType: body.companyType || body.company_type, variant: body.variant }) : this.mockProvider.verifyCac({ rcNumber: rc, companyType: body.companyType || body.company_type, variant: body.variant }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Post('nuban-kyc')
  async verifyNubanKyc(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const identifier = `${body.bankCode || ''}_${body.accountNumber || ''}`.trim();
    const isLive = req.environment === Environment.LIVE;
    return this.processVerification(
      req,
      'nuban_kyc',
      identifier,
      body,
      () => (isLive ? this.dojahProvider.verifyNubanKycStatus(body) : this.mockProvider.verifyNubanKycStatus(body))
    );
  }

  @UseGuards(ApiKeyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Post('tin')
  async verifyTin(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const identifier = String(body.tin || '').trim();
    if (!identifier) {
      throw new BadRequestException('Tax Identification Number (TIN) is required.');
    }
    const isLive = req.environment === Environment.LIVE;
    const provider: any = isLive ? this.dojahProvider : this.mockProvider;
    return this.processVerification(
      req,
      'tin',
      identifier,
      body,
      () => provider.verifyTin({ tin: identifier, consent: true })
    );
  }

  @UseGuards(ApiKeyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Post('dl')
  async verifyDl(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const identifier = String(body.licenseNumber || body.license_number || body.dlNumber || '').trim();
    if (!identifier) {
      throw new BadRequestException("Driver's License number is required.");
    }
    const isLive = req.environment === Environment.LIVE;
    const provider: any = isLive ? this.dojahProvider : this.mockProvider;
    return this.processVerification(
      req,
      'dl',
      identifier,
      body,
      () => (typeof provider.verifyDriversLicense === 'function'
        ? provider.verifyDriversLicense({ licenseNumber: identifier, dob: body.dob, consent: true })
        : provider.verifyDl({ licenseNumber: identifier, dob: body.dob, consent: true }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Post('vin')
  async verifyVin(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const identifier = String(body.vin || '').trim();
    if (!identifier) {
      throw new BadRequestException("Voter's Identification Number (VIN) is required.");
    }
    const isLive = req.environment === Environment.LIVE;
    const provider: any = isLive ? this.dojahProvider : this.mockProvider;
    return this.processVerification(
      req,
      'vin',
      identifier,
      body,
      () => (typeof provider.verifyVotersCard === 'function'
        ? provider.verifyVotersCard({ vin: identifier, state: body.state, lastName: body.lastName, consent: true })
        : provider.verifyVin({ vin: identifier, state: body.state, lastName: body.lastName, consent: true }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @Post('passport')
  async verifyPassport(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const identifier = String(body.passportNumber || body.passport_number || '').trim();
    if (!identifier) {
      throw new BadRequestException('International Passport number is required.');
    }
    const isLive = req.environment === Environment.LIVE;
    const provider: any = isLive ? this.dojahProvider : this.mockProvider;
    return this.processVerification(
      req,
      'passport',
      identifier,
      body,
      () => provider.verifyPassport({ passportNumber: identifier, lastName: body.lastName, dob: body.dob, consent: true })
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('messaging/sms')
  async sendSms(@Req() req: any, @Body() body: any) {
    if (!body.destination || !body.message) {
      throw new BadRequestException('destination and message are required.');
    }
    const isLive = req.environment === Environment.LIVE;
    return isLive ? this.dojahProvider.sendSms(body) : this.mockProvider.sendSms(body);
  }

  @UseGuards(ApiKeyGuard)
  @Post('purchase/airtime')
  async purchaseAirtime(@Req() req: any, @Body() body: any) {
    if (!body.amount || !body.destination) {
      throw new BadRequestException('amount and destination are required.');
    }
    const isLive = req.environment === Environment.LIVE;
    return isLive ? this.dojahProvider.purchaseAirtime(body) : this.mockProvider.purchaseAirtime(body);
  }

  @UseGuards(ApiKeyGuard)
  @Post('purchase/data')
  async purchaseData(@Req() req: any, @Body() body: any) {
    if (!body.plan || !body.destination) {
      throw new BadRequestException('plan and destination are required.');
    }
    const isLive = req.environment === Environment.LIVE;
    return isLive ? this.dojahProvider.purchaseData(body) : this.mockProvider.purchaseData(body);
  }

  @UseGuards(ApiKeyGuard)
  @Get('purchase/data-plans')
  async getDataPlans(@Req() req: any) {
    const isLive = req.environment === Environment.LIVE;
    return isLive ? this.dojahProvider.getDataPlans() : this.mockProvider.getDataPlans();
  }

  @UseGuards(ApiKeyGuard)
  @Get('providers/upstream/balance')
  async getUpstreamBalance() {
    return this.dojahProvider.getUpstreamBalance();
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
        identifier: log.requestPayload?.nin ? ('***' + String(log.requestPayload.nin).slice(-4)) : (log.requestPayload?.bvn ? ('***' + String(log.requestPayload.bvn).slice(-4)) : (log.requestPayload?.accountNumber || log.requestPayload?.rcNumber || log.requestPayload?.phone || ('Ref: ' + log.id.slice(0, 8)))),
        format: log.requestPayload?.format || 'slip',
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
      requestPayload: log.requestPayload,
      responsePayload: decryptPayload(log.responsePayload),
      data: decryptPayload(log.responsePayload),
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

    const avgLiveQuery = await this.logRepository
      .createQueryBuilder('log')
      .select('AVG(log.latencyMs)', 'avg')
      .where('log.org_id = :orgId AND log.isCached = false', { orgId })
      .getRawOne();

    const avgCacheQuery = await this.logRepository
      .createQueryBuilder('log')
      .select('AVG(log.latencyMs)', 'avg')
      .where('log.org_id = :orgId AND log.isCached = true', { orgId })
      .getRawOne();

    const averageLiveLatency = `${Math.round(Number(avgLiveQuery?.avg) || 185)}ms`;
    const averageCacheLatency = `${Math.round(Number(avgCacheQuery?.avg) || 14)}ms`;

    return {
      totalRequests: total,
      liveRequests: liveCount,
      cacheRequests: cachedCount,
      cacheHitRatio,
      totalSavingsNgx,
      averageLiveLatency,
      averageCacheLatency,
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
    @Body()
    body: {
      service: 'bvn' | 'nin' | 'nuban' | 'phone' | 'cac' | 'nuban_kyc' | 'tin' | 'dl' | 'vin' | 'passport' | string;
      environment: Environment;
      payload: any;
    }
  ) {
    if (body.payload?.consent !== true && body.payload?.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }

    const targetEnv = String(body.environment).toLowerCase() === 'live' ? Environment.LIVE : Environment.SANDBOX;
    const service = String(body.service || '').toLowerCase();
    let identifier = '';
    if (service === 'bvn') identifier = String(body.payload?.bvn || '').trim();
    else if (service === 'nin') identifier = String(body.payload?.nin || '').trim();
    else if (service === 'phone') identifier = String(body.payload?.phoneNumber || body.payload?.phone_number || '').trim();
    else if (service === 'cac') identifier = String(body.payload?.rcNumber || body.payload?.rc_number || '').trim();
    else if (service === 'nuban' || service === 'nuban_kyc') identifier = `${body.payload?.bankCode || ''}_${body.payload?.accountNumber || ''}`.trim();
    else if (service === 'tin') identifier = String(body.payload?.tin || '').trim();
    else if (service === 'dl') identifier = String(body.payload?.licenseNumber || body.payload?.license_number || body.payload?.dlNumber || '').trim();
    else if (service === 'vin') identifier = String(body.payload?.vin || '').trim();
    else if (service === 'passport') identifier = String(body.payload?.passportNumber || body.payload?.passport_number || '').trim();

    const mockReq = {
      organizationId: req.organizationId,
      environment: targetEnv,
      apiKeyId: 'manual_workspace',
      headers: {},
    };

    const isLive = targetEnv === Environment.LIVE;
    const provider: any = isLive ? this.dojahProvider : this.mockProvider;

    const rawResult = await this.processVerification(
      mockReq,
      service,
      identifier,
      body.payload,
      async () => {
        if (service === 'bvn') {
          return isLive ? this.dojahProvider.verifyBvn(body.payload) : this.mockProvider.verifyBvn(body.payload);
        }
        if (service === 'nin') {
          return isLive ? this.dojahProvider.verifyNin(body.payload) : this.mockProvider.verifyNin(body.payload);
        }
        if (service === 'phone') {
          return isLive
            ? this.dojahProvider.verifyPhoneNumber({ phoneNumber: identifier, variant: body.payload?.variant })
            : this.mockProvider.verifyPhoneNumber({ phoneNumber: identifier, variant: body.payload?.variant });
        }
        if (service === 'cac') {
          return isLive
            ? this.dojahProvider.verifyCac({ rcNumber: identifier, companyType: body.payload?.companyType, variant: body.payload?.variant })
            : this.mockProvider.verifyCac({ rcNumber: identifier, companyType: body.payload?.companyType, variant: body.payload?.variant });
        }
        if (service === 'nuban_kyc') {
          return isLive ? this.dojahProvider.verifyNubanKycStatus(body.payload) : this.mockProvider.verifyNubanKycStatus(body.payload);
        }
        if (service === 'nuban') {
          return isLive ? this.dojahProvider.verifyBankAccount(body.payload) : this.mockProvider.verifyBankAccount(body.payload);
        }
        if (service === 'tin') {
          if (typeof provider.verifyTin === 'function') {
            return provider.verifyTin({ tin: identifier, consent: true });
          }
        }
        if (service === 'dl') {
          if (typeof provider.verifyDriversLicense === 'function') {
            return provider.verifyDriversLicense({
              licenseNumber: identifier,
              dob: body.payload?.dob,
              consent: true,
            });
          }
          if (typeof provider.verifyDl === 'function') {
            return provider.verifyDl({
              licenseNumber: identifier,
              dob: body.payload?.dob,
              consent: true,
            });
          }
        }
        if (service === 'vin') {
          if (typeof provider.verifyVotersCard === 'function') {
            return provider.verifyVotersCard({
              vin: identifier,
              state: body.payload?.state,
              lastName: body.payload?.lastName,
              consent: true,
            });
          }
          if (typeof provider.verifyVin === 'function') {
            return provider.verifyVin({
              vin: identifier,
              state: body.payload?.state,
              lastName: body.payload?.lastName,
              consent: true,
            });
          }
        }
        if (service === 'passport') {
          if (typeof provider.verifyPassport === 'function') {
            return provider.verifyPassport({
              passportNumber: identifier,
              lastName: body.payload?.lastName,
              dob: body.payload?.dob,
              consent: true,
            });
          }
        }
        throw new BadRequestException(`Unsupported verification service: ${body.service}`);
      }
    );

    const reference = rawResult?.meta?.referenceId || rawResult?.meta?.reference || `vx_${uuidv4().slice(0, 12)}`;
    const verifiedAt = new Date().toISOString();

    return {
      success: rawResult?.status === 'success' || rawResult?.success === true,
      status: rawResult?.status || 'success',
      service,
      reference,
      verifiedAt,
      data: rawResult?.data !== undefined ? rawResult.data : rawResult,
      meta: {
        ...rawResult?.meta,
        referenceId: reference,
        verifiedAt,
      },
    };
  }

  private async processVerification(
    req: any,
    serviceType: 'bvn' | 'nin' | 'nuban' | 'phone' | 'cac' | 'nuban_kyc' | 'tin' | 'dl' | 'vin' | 'passport' | string,
    identifier: string,
    payload: any,
    providerCall: () => Promise<any>
  ) {
    const startTime = Date.now();
    const bypassCache =
      req.headers['x-bypass-cache'] === 'true' ||
      req.headers['x-refresh-cache'] === 'true' ||
      payload?.bypassCache === true;

    const validEnv = normalizeEnvironment(req.environment);

    // 1. Check Smart Identity Cache (if enabled & not bypassed)
    if (!bypassCache && identifier) {
      const cached = await this.identityCacheService.getCachedRecord(
        req.organizationId,
        validEnv,
        serviceType,
        identifier,
      );

      if (cached) {
        // Cache HIT!
        const cacheRate = await this.billingService.getEffectiveRate(req.organizationId, serviceType as any, true);
        const cost = cacheRate.effectiveRate;
        const reference = `vx_cache_${uuidv4().slice(0, 12)}`;

        // Deduct discounted cache fee atomically
        await this.billingService.deductCredits(req.organizationId, validEnv, cost, reference);

        const latencyMs = Math.max(11, Date.now() - startTime);

        // Audit Log entry with isCached = true
        await this.logRepository.save({
          org_id: req.organizationId,
          environment: validEnv,
          api_key_id: req.apiKeyId || 'sdk_key',
          serviceType,
          status: VerificationStatus.SUCCESS,
          upstreamProvider: 'verixa_smart_cache',
          isCached: true,
          source: 'CACHE',
          costDeducted: cost,
          latencyMs,
          cacheKey: this.identityCacheService.generateKey(req.organizationId, validEnv, serviceType, identifier),
          idempotencyKey: req.headers['idempotency-key'] || undefined,
          requestPayload: maskPii(payload),
          responsePayload: encryptPayload(this.sanitizeIdentityRetention(cached.data)),
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
            environment: validEnv,
          },
        };
      }
    }

    // 2. Cache MISS: Live Upstream Registry Query (e.g. Primary Registry / NIMC / NIBSS)
    const liveRate = await this.billingService.getEffectiveRate(req.organizationId, serviceType as any, false);
    const cost = liveRate.effectiveRate;
    const reference = uuidv4();

    // Deduct standard live fee atomically
    await this.billingService.deductCredits(req.organizationId, validEnv, cost, reference);

    try {
      // Execute Upstream Provider Call
      const result = await providerCall();
      const latencyMs = Math.max(135, Date.now() - startTime);

      // If lookup succeeded and returned data, store into Smart Identity Cache
      if (result.status === 'success' && result.data && identifier) {
        await this.identityCacheService.setCachedRecord(
          req.organizationId,
          validEnv,
          serviceType,
          identifier,
          result.data,
          result.meta?.provider || 'direct',
        );
      }

      // Log Live Request
      await this.logRepository.save({
        org_id: req.organizationId,
        environment: validEnv,
        api_key_id: req.apiKeyId || 'sdk_key',
        serviceType,
        status:
          result.status === 'success'
            ? VerificationStatus.SUCCESS
            : VerificationStatus.FAILED,
        upstreamProvider: result.meta?.provider || 'direct',
        isCached: false,
        source: 'LIVE',
        costDeducted: cost,
        latencyMs,
        cacheKey: identifier ? this.identityCacheService.generateKey(req.organizationId, validEnv, serviceType, identifier) : undefined,
        idempotencyKey: req.headers['idempotency-key'] || undefined,
        requestPayload: maskPii(payload),
        responsePayload: result.data ? encryptPayload(this.sanitizeIdentityRetention(result.data)) : null,
      });

      return {
        ...result,
        meta: {
          ...result.meta,
          cached: false,
          referenceId: reference,
          cost_ngx: cost,
          latency_ms: latencyMs,
          environment: validEnv,
        },
      };
    } catch (error) {
      // Refund if upstream fails
      await this.billingService.refundCredits(req.organizationId, validEnv, cost, reference);
      throw new InternalServerErrorException('Upstream provider failed');
    }
  }

  private sanitizeIdentityRetention(data: any): any {
    return sanitizeIdentityRetention(data);
  }
}

