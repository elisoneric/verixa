import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { DojahProvider } from './providers/dojah.provider';
import { MockProvider } from './providers/mock.provider';
import { BillingService } from '../billing/billing.service';
import { IdentityCacheService } from './identity-cache.service';
import { Environment, normalizeEnvironment } from '../organizations/entities/environment-config.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationLog, VerificationStatus } from './entities/verification-log.entity';
import { Wallet } from '../billing/entities/wallet.entity';
import { v4 as uuidv4 } from 'uuid';
import { encryptPayload, sanitizeIdentityRetention } from '../common/utils/crypto.util';

@Controller(['api', ''])
export class ApiController {
  constructor(
    private mockProvider: MockProvider,
    private dojahProvider: DojahProvider,
    private billingService: BillingService,
    private identityCacheService: IdentityCacheService,
    @InjectRepository(VerificationLog)
    private logRepository: Repository<VerificationLog>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  // 0. Balance API Endpoints (Programmatic Developer API Key)
  @UseGuards(ApiKeyGuard)
  @Get('balance')
  @HttpCode(HttpStatus.OK)
  async getDirectApiBalance(@Req() req: any) {
    return this.getApiBalance(req);
  }

  @UseGuards(ApiKeyGuard)
  @Get('v1/balance')
  @HttpCode(HttpStatus.OK)
  async getApiBalance(@Req() req: any) {
    const data = await this.billingService.getBalance(req.organizationId);
    return {
      status: 'success',
      data: {
        liveBalance: data.live?.balance ?? 0,
        sandboxBalance: data.sandbox?.balance ?? 0,
        currency: 'NGN',
        environment: normalizeEnvironment(req.environment),
        dedicatedVirtualAccount: data.dedicatedVirtualAccount,
      },
    };
  }

  @UseGuards(ApiKeyGuard)
  @Get('v1/billing/balance')
  @HttpCode(HttpStatus.OK)
  async getApiBillingBalance(@Req() req: any) {
    return this.getApiBalance(req);
  }

  private async executeVerification(
    req: any,
    service: string,
    identifier: string,
    payload: any,
    baseRate: number,
    queryFn: () => Promise<any>,
    exactPrice?: number,
  ) {
    if (payload?.consent === false || payload?.consent === 'false') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }

    const orgId = req.organizationId;
    const env = normalizeEnvironment(req.environment);
    const startTime = Date.now();

    // Map service string to BillingService serviceType
    let rateKey: any = 'nin';
    if (service === 'nin_advance') rateKey = 'nin_advance';
    else if (service === 'nin_slip') rateKey = 'nin_slip';
    else if (service === 'bvn' || service === 'bvn_advance' || service === 'bvn_face_match') rateKey = 'bvn';
    else if (service === 'cac') rateKey = 'cac';
    else if (service === 'phone') rateKey = 'phone';
    else if (service === 'nuban' || service === 'nuban_kyc') rateKey = 'nuban';
    else if (service === 'sms') rateKey = 'sms';
    else if (service === 'airtime') rateKey = 'airtime';
    else if (service === 'data') rateKey = 'data';

    // 1. Check Smart Identity Cache
    if (identifier) {
      const cached = await this.identityCacheService.getCachedRecord(
        orgId,
        env,
        service,
        identifier,
      );

      if (cached) {
        const cacheRateInfo = await this.billingService.getEffectiveRate(orgId, rateKey, true);
        const cacheCost = exactPrice !== undefined ? Math.round(exactPrice * 0.5) : cacheRateInfo.effectiveRate;
        const reference = `vx_cache_${uuidv4().slice(0, 12)}`;

        // Strict pre-debit: If balance is insufficient, rejects immediately with 400!
        if (orgId) {
          await this.billingService.deductCredits(orgId, env, cacheCost, reference);
        }

        const latencyMs = Math.max(11, Date.now() - startTime);

        await this.logRepository.save({
          org_id: orgId,
          environment: env,
          api_key_id: req.apiKeyId || 'api_key',
          serviceType: service,
          status: VerificationStatus.SUCCESS,
          upstreamProvider: 'verixa_smart_cache',
          isCached: true,
          source: 'CACHE',
          costDeducted: cacheCost,
          latencyMs,
          cacheKey: this.identityCacheService.generateKey(orgId, env, service, identifier),
          idempotencyKey: req.headers?.['idempotency-key'] || undefined,
          requestPayload: payload,
          responsePayload: cached.data ? encryptPayload(sanitizeIdentityRetention(cached.data)) : null,
        });

        const cleanEntity = cached.data?.entity !== undefined ? cached.data.entity : cached.data;

        if (req.res && typeof req.res.setHeader === 'function') {
          try {
            req.res.setHeader('X-Request-Id', reference);
            req.res.setHeader('X-Cached', 'true');
            req.res.setHeader('X-Billed-Amount', String(cacheCost));
            req.res.setHeader('X-Latency-Ms', String(latencyMs));
          } catch {
            // ignore header errors
          }
        }

        if (req.query?.verbose === 'true' || req.headers?.['x-verixa-verbose'] === 'true') {
          return {
            status: 'success',
            entity: cleanEntity,
            data: cleanEntity,
            billed_amount: cacheCost,
            cached: true,
            meta: {
              request_id: reference,
              service,
              latency_ms: latencyMs,
              environment: env,
            },
          };
        }

        return {
          entity: cleanEntity,
        };
      }
    }

    // 2. Resolve Dynamic Live Rate (System Config & Org Custom Overrides)
    const liveRateInfo = await this.billingService.getEffectiveRate(orgId, rateKey, false);
    const finalPrice = exactPrice !== undefined ? exactPrice : liveRateInfo.effectiveRate;
    const reference = `vx_live_${uuidv4().slice(0, 12)}`;

    // 3. MANDATORY PRE-DEBIT: Deduct usage fee BEFORE querying upstream gateway!
    // If balance is 0 or insufficient, throws BadRequestException immediately.
    // The upstream gateway is NEVER called if wallet has insufficient balance!
    if (orgId) {
      await this.billingService.deductCredits(orgId, env, finalPrice, reference);
    }

    // 4. Query Primary Gateway
    let result: any;
    try {
      result = await queryFn();
    } catch (err: any) {
      // Auto-refund deducted credits immediately if upstream gateway failed
      if (orgId) {
        try {
          await this.billingService.refundCredits(orgId, env, finalPrice, reference);
        } catch {
          // ignore refund error
        }
      }
      throw new BadRequestException(err.message || `Failed to verify ${service}`);
    }

    // 5. Cache verified record
    if (identifier && result?.data) {
      await this.identityCacheService.setCachedRecord(orgId, env, service, identifier, result.data, 'direct');
    }

    const latencyMs = Math.max(35, Date.now() - startTime);
    const rawData = result?.data || result;

    await this.logRepository.save({
      org_id: orgId,
      environment: env,
      api_key_id: req.apiKeyId || 'api_key',
      serviceType: service,
      status: VerificationStatus.SUCCESS,
      upstreamProvider: 'direct',
      isCached: false,
      source: 'LIVE',
      costDeducted: finalPrice,
      latencyMs,
      cacheKey: this.identityCacheService.generateKey(orgId, env, service, identifier),
      idempotencyKey: req.headers?.['idempotency-key'] || undefined,
      requestPayload: payload,
      responsePayload: rawData ? encryptPayload(sanitizeIdentityRetention(rawData)) : null,
    });

    const cleanEntity = rawData?.entity !== undefined ? rawData.entity : rawData;

    if (req.res && typeof req.res.setHeader === 'function') {
      try {
        req.res.setHeader('X-Request-Id', reference);
        req.res.setHeader('X-Cached', 'false');
        req.res.setHeader('X-Billed-Amount', String(finalPrice));
        req.res.setHeader('X-Latency-Ms', String(latencyMs));
      } catch {
        // ignore header errors
      }
    }

    if (req.query?.verbose === 'true' || req.headers?.['x-verixa-verbose'] === 'true') {
      return {
        status: 'success',
        entity: cleanEntity,
        data: cleanEntity,
        billed_amount: finalPrice,
        cached: false,
        meta: {
          request_id: reference,
          service,
          latency_ms: latencyMs,
          environment: env,
        },
      };
    }

    return {
      entity: cleanEntity,
    };
  }

  // ==========================================
  // UNIVERSAL REST KYC & IDENTITY SUITE (/api/v1/...)
  // ==========================================

  // --- 1. BVN Endpoints ---

  // GET & POST /api/v1/kyc/bvn (Validate & Match)
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/bvn')
  @HttpCode(HttpStatus.OK)
  async getKycBvn(@Req() req: any, @Query() query: any) {
    const bvn = String(query.bvn || query.id || '').trim();
    if (!bvn) throw new BadRequestException('bvn query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'bvn',
      bvn,
      query,
      95,
      () => (isLive ? this.dojahProvider.verifyBvn({ ...query, bvn, variant: 'match' }) : this.mockProvider.verifyBvn({ ...query, bvn, variant: 'match' }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/bvn')
  @HttpCode(HttpStatus.OK)
  async postKycBvn(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const bvn = String(payload.bvn || payload.id || '').trim();
    if (!bvn) throw new BadRequestException('bvn is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'bvn',
      bvn,
      payload,
      95,
      () => (isLive ? this.dojahProvider.verifyBvn({ ...payload, bvn, variant: 'match' }) : this.mockProvider.verifyBvn({ ...payload, bvn, variant: 'match' }))
    );
  }

  // GET /api/v1/kyc/bvn/full
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/bvn/full')
  @HttpCode(HttpStatus.OK)
  async getKycBvnFull(@Req() req: any, @Query() query: any) {
    const bvn = String(query.bvn || query.id || '').trim();
    if (!bvn) throw new BadRequestException('bvn query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'bvn',
      bvn,
      query,
      95,
      () => (isLive ? this.dojahProvider.verifyBvn({ ...query, bvn, variant: 'full' }) : this.mockProvider.verifyBvn({ ...query, bvn, variant: 'full' }))
    );
  }

  // GET /api/v1/kyc/bvn/advance
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/bvn/advance')
  @HttpCode(HttpStatus.OK)
  async getKycBvnAdvance(@Req() req: any, @Query() query: any) {
    const bvn = String(query.bvn || query.id || '').trim();
    if (!bvn) throw new BadRequestException('bvn query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'bvn_advance',
      bvn,
      query,
      125,
      () => (isLive ? this.dojahProvider.verifyBvn({ ...query, bvn, variant: 'advance' }) : this.mockProvider.verifyBvn({ ...query, bvn, variant: 'advance' }))
    );
  }

  // POST /api/v1/kyc/bvn/verify (Biometric Selfie Match)
  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/bvn/verify')
  @HttpCode(HttpStatus.OK)
  async verifyKycBvnSelfie(@Req() req: any, @Body() body: any) {
    const bvn = String(body.bvn || body.id || '').trim();
    const selfie = String(body.selfie_image || body.image || '').trim();
    if (!bvn || !selfie) throw new BadRequestException('bvn and selfie_image (base64) are required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'bvn_face_match',
      bvn,
      body,
      150,
      () => (isLive ? this.dojahProvider.verifyFaceMatch({ idType: 'BVN', idNumber: bvn, selfieImageBase64: selfie }) : this.mockProvider.verifyFaceMatch({ idType: 'BVN', idNumber: bvn, selfieImageBase64: selfie }))
    );
  }

  // --- 2. NIN Endpoints ---

  // GET & POST /api/v1/kyc/nin (Basic NIN)
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/nin')
  @HttpCode(HttpStatus.OK)
  async getKycNin(@Req() req: any, @Query() query: any) {
    const nin = String(query.nin || query.id || '').trim();
    if (!nin) throw new BadRequestException('nin query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin',
      nin,
      query,
      125,
      () => (isLive ? this.dojahProvider.verifyNin({ nin, ...query, tier: 'basic' }) : this.mockProvider.verifyNin({ nin, ...query, tier: 'basic' }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/nin')
  @HttpCode(HttpStatus.OK)
  async postKycNin(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const nin = String(payload.nin || payload.id || '').trim();
    if (!nin) throw new BadRequestException('nin is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin',
      nin,
      payload,
      125,
      () => (isLive ? this.dojahProvider.verifyNin({ nin, ...payload, tier: payload.tier || 'basic' }) : this.mockProvider.verifyNin({ nin, ...payload, tier: payload.tier || 'basic' }))
    );
  }

  // GET & POST /api/v1/kyc/nin/advance
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/nin/advance')
  @HttpCode(HttpStatus.OK)
  async getKycNinAdvance(@Req() req: any, @Query() query: any) {
    const nin = String(query.nin || query.id || '').trim();
    if (!nin) throw new BadRequestException('nin query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin_advance',
      nin,
      query,
      125,
      () => (isLive ? this.dojahProvider.verifyNinAdvance({ nin, ...query }) : this.mockProvider.verifyNinAdvance({ nin, ...query }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/nin/advance')
  @HttpCode(HttpStatus.OK)
  async postKycNinAdvance(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const nin = String(payload.nin || payload.id || '').trim();
    if (!nin) throw new BadRequestException('nin is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin_advance',
      nin,
      payload,
      125,
      () => (isLive ? this.dojahProvider.verifyNinAdvance({ nin, ...payload }) : this.mockProvider.verifyNinAdvance({ nin, ...payload }))
    );
  }

  // GET & POST /api/v1/kyc/nin/premium
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/nin/premium')
  @HttpCode(HttpStatus.OK)
  async getKycNinPremium(@Req() req: any, @Query() query: any) {
    const nin = String(query.nin || query.id || '').trim();
    if (!nin) throw new BadRequestException('nin query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin_premium',
      nin,
      query,
      150,
      () => (isLive ? this.dojahProvider.verifyNin({ nin, tier: 'premium' }) : this.mockProvider.verifyNin({ nin, tier: 'premium' }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/nin/premium')
  @HttpCode(HttpStatus.OK)
  async postKycNinPremium(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const nin = String(payload.nin || payload.id || '').trim();
    if (!nin) throw new BadRequestException('nin is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin_premium',
      nin,
      payload,
      150,
      () => (isLive ? this.dojahProvider.verifyNin({ nin, ...payload, tier: 'premium' }) : this.mockProvider.verifyNin({ nin, ...payload, tier: 'premium' }))
    );
  }

  // GET & POST /api/v1/kyc/nin/nin_slip
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/nin/nin_slip')
  @HttpCode(HttpStatus.OK)
  async getKycNinSlip(@Req() req: any, @Query() query: any) {
    const nin = String(query.nin || query.id || '').trim();
    if (!nin) throw new BadRequestException('nin query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin_slip',
      nin,
      query,
      250,
      () => (isLive ? this.dojahProvider.verifyNin({ nin, tier: 'slip' }) : this.mockProvider.verifyNin({ nin, tier: 'slip' }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/nin/nin_slip')
  @HttpCode(HttpStatus.OK)
  async postKycNinSlip(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const nin = String(payload.nin || payload.id || '').trim();
    if (!nin) throw new BadRequestException('nin is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin_slip',
      nin,
      payload,
      250,
      () => (isLive ? this.dojahProvider.verifyNin({ nin, ...payload, tier: 'slip' }) : this.mockProvider.verifyNin({ nin, ...payload, tier: 'slip' }))
    );
  }

  // POST /api/v1/kyc/nin/verify (Biometric Selfie Match)
  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/nin/verify')
  @HttpCode(HttpStatus.OK)
  async verifyKycNinSelfie(@Req() req: any, @Body() body: any) {
    const nin = String(body.nin || body.id || '').trim();
    const selfie = String(body.selfie_image || body.image || '').trim();
    if (!nin || !selfie) throw new BadRequestException('nin and selfie_image (base64) are required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin_face_match',
      nin,
      body,
      150,
      () => (isLive ? this.dojahProvider.verifyFaceMatch({ idType: 'NIN', idNumber: nin, selfieImageBase64: selfie }) : this.mockProvider.verifyFaceMatch({ idType: 'NIN', idNumber: nin, selfieImageBase64: selfie }))
    );
  }

  // --- 3. Phone Number Endpoints ---

  // GET /api/v1/kyc/phone_number/basic
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/phone_number/basic')
  @HttpCode(HttpStatus.OK)
  async getKycPhoneBasic(@Req() req: any, @Query() query: any) {
    const phone = String(query.phone_number || query.phone || '').trim();
    if (!phone) throw new BadRequestException('phone_number query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'phone_basic',
      phone,
      query,
      50,
      () => (isLive ? this.dojahProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'basic' }) : this.mockProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'basic' }))
    );
  }

  // GET /api/v1/kyc/phone_number (Full)
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/phone_number')
  @HttpCode(HttpStatus.OK)
  async getKycPhoneAdvance(@Req() req: any, @Query() query: any) {
    const phone = String(query.phone_number || query.phone || '').trim();
    if (!phone) throw new BadRequestException('phone_number query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'phone_advance',
      phone,
      query,
      95,
      () => (isLive ? this.dojahProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'advance' }) : this.mockProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'advance' }))
    );
  }

  // --- 4. Bank Account & NUBAN ---

  // GET & POST /api/v1/kyc/account (Resolve Account)
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/account')
  @HttpCode(HttpStatus.OK)
  async getKycAccount(@Req() req: any, @Query() query: any) {
    const accountNumber = String(query.account_number || query.accountNumber || '').trim();
    const bankCode = String(query.bank_code || query.bankCode || '').trim();
    if (!accountNumber || !bankCode) throw new BadRequestException('account_number and bank_code query parameters are required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'account_resolve',
      `${bankCode}_${accountNumber}`,
      query,
      0,
      () => (isLive ? this.dojahProvider.verifyBankAccount({ accountNumber, bankCode }) : this.mockProvider.verifyBankAccount({ accountNumber, bankCode })),
      0
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/account')
  @HttpCode(HttpStatus.OK)
  async postKycAccount(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const accountNumber = String(payload.account_number || payload.accountNumber || '').trim();
    const bankCode = String(payload.bank_code || payload.bankCode || '').trim();
    if (!accountNumber || !bankCode) throw new BadRequestException('account_number and bank_code are required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'account_resolve',
      `${bankCode}_${accountNumber}`,
      payload,
      0,
      () => (isLive ? this.dojahProvider.verifyBankAccount({ accountNumber, bankCode }) : this.mockProvider.verifyBankAccount({ accountNumber, bankCode })),
      0
    );
  }

  // GET /api/v1/kyc/nuban/status
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/nuban/status')
  @HttpCode(HttpStatus.OK)
  async getKycNubanStatus(@Req() req: any, @Query() query: any) {
    const accountNumber = String(query.account_number || query.accountNumber || '').trim();
    const bankCode = String(query.bank_code || query.bankCode || '').trim();
    if (!accountNumber || !bankCode) throw new BadRequestException('account_number and bank_code are required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nuban_status',
      `${bankCode}_${accountNumber}`,
      query,
      35,
      () => (isLive ? this.dojahProvider.verifyNubanKycStatus({ accountNumber, bankCode }) : this.mockProvider.verifyNubanKycStatus({ accountNumber, bankCode }))
    );
  }

  // --- 5. Business Verification (CAC & TIN) ---

  // GET & POST /api/v1/kyc/cac/basic
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/cac/basic')
  @HttpCode(HttpStatus.OK)
  async getKycCacBasic(@Req() req: any, @Query() query: any) {
    const rc = String(query.rc_number || query.rcNumber || '').trim();
    if (!rc) throw new BadRequestException('rc_number query parameter is required');
    const companyType = query.company_type || query.companyType || 'COMPANY';
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'cac_basic',
      rc,
      query,
      120,
      () => (isLive ? this.dojahProvider.verifyCac({ rcNumber: rc, companyType, variant: 'basic' }) : this.mockProvider.verifyCac({ rcNumber: rc, companyType, variant: 'basic' }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/cac/basic')
  @HttpCode(HttpStatus.OK)
  async postKycCacBasic(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const rc = String(payload.rc_number || payload.rcNumber || '').trim();
    if (!rc) throw new BadRequestException('rc_number is required');
    const companyType = payload.company_type || payload.companyType || 'COMPANY';
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'cac_basic',
      rc,
      payload,
      120,
      () => (isLive ? this.dojahProvider.verifyCac({ rcNumber: rc, companyType, variant: 'basic' }) : this.mockProvider.verifyCac({ rcNumber: rc, companyType, variant: 'basic' }))
    );
  }

  // GET & POST /api/v1/kyc/cac/advance
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/cac/advance')
  @HttpCode(HttpStatus.OK)
  async getKycCacAdvance(@Req() req: any, @Query() query: any) {
    const rc = String(query.rc_number || query.rcNumber || '').trim();
    if (!rc) throw new BadRequestException('rc_number query parameter is required');
    const companyType = query.company_type || query.companyType || 'COMPANY';
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'cac_advance',
      rc,
      query,
      250,
      () => (isLive ? this.dojahProvider.verifyCac({ rcNumber: rc, companyType, variant: 'advance' }) : this.mockProvider.verifyCac({ rcNumber: rc, companyType, variant: 'advance' }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/cac/advance')
  @HttpCode(HttpStatus.OK)
  async postKycCacAdvance(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const rc = String(payload.rc_number || payload.rcNumber || '').trim();
    if (!rc) throw new BadRequestException('rc_number is required');
    const companyType = payload.company_type || payload.companyType || 'COMPANY';
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'cac_advance',
      rc,
      payload,
      250,
      () => (isLive ? this.dojahProvider.verifyCac({ rcNumber: rc, companyType, variant: 'advance' }) : this.mockProvider.verifyCac({ rcNumber: rc, companyType, variant: 'advance' }))
    );
  }

  // GET & POST /api/v1/kyc/tin
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/tin')
  @HttpCode(HttpStatus.OK)
  async getKycTin(@Req() req: any, @Query() query: any) {
    const tin = String(query.tin || query.tax_id || '').trim();
    if (!tin) throw new BadRequestException('tin query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'tin_verification',
      tin,
      query,
      90,
      () => (isLive ? this.dojahProvider.verifyTin({ tin }) : this.mockProvider.verifyTin({ tin }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/tin')
  @HttpCode(HttpStatus.OK)
  async postKycTin(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const tin = String(payload.tin || payload.tax_id || '').trim();
    if (!tin) throw new BadRequestException('tin is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'tin_verification',
      tin,
      payload,
      90,
      () => (isLive ? this.dojahProvider.verifyTin({ tin }) : this.mockProvider.verifyTin({ tin }))
    );
  }

  // --- 6. Government Identity Documents ---

  // GET & POST /api/v1/kyc/dl (Driver's License)
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/dl')
  @HttpCode(HttpStatus.OK)
  async getKycDl(@Req() req: any, @Query() query: any) {
    const license = String(query.license_number || query.licenseNumber || '').trim();
    if (!license) throw new BadRequestException('license_number query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'drivers_license',
      license,
      query,
      95,
      () => (isLive ? this.dojahProvider.verifyDriversLicense({ licenseNumber: license, dob: query.dob || query.date_of_birth }) : this.mockProvider.verifyDriversLicense({ licenseNumber: license, dob: query.dob || query.date_of_birth }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/dl')
  @HttpCode(HttpStatus.OK)
  async postKycDl(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const license = String(payload.license_number || payload.licenseNumber || '').trim();
    if (!license) throw new BadRequestException('license_number is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'drivers_license',
      license,
      payload,
      95,
      () => (isLive ? this.dojahProvider.verifyDriversLicense({ licenseNumber: license, dob: payload.dob || payload.date_of_birth }) : this.mockProvider.verifyDriversLicense({ licenseNumber: license, dob: payload.dob || payload.date_of_birth }))
    );
  }

  // GET & POST /api/v1/kyc/vin (Voter's Card)
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/vin')
  @HttpCode(HttpStatus.OK)
  async getKycVin(@Req() req: any, @Query() query: any) {
    const vin = String(query.vin || query.voter_id || '').trim();
    if (!vin) throw new BadRequestException('vin query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'voters_card',
      vin,
      query,
      80,
      () => (isLive ? this.dojahProvider.verifyVotersCard({ vin, state: query.state, lastName: query.last_name || query.lastName }) : this.mockProvider.verifyVotersCard({ vin, state: query.state, lastName: query.last_name || query.lastName }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/vin')
  @HttpCode(HttpStatus.OK)
  async postKycVin(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const vin = String(payload.vin || payload.voter_id || '').trim();
    if (!vin) throw new BadRequestException('vin is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'voters_card',
      vin,
      payload,
      80,
      () => (isLive ? this.dojahProvider.verifyVotersCard({ vin, state: payload.state, lastName: payload.last_name || payload.lastName }) : this.mockProvider.verifyVotersCard({ vin, state: payload.state, lastName: payload.last_name || payload.lastName }))
    );
  }

  // GET & POST /api/v1/kyc/passport
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/passport')
  @HttpCode(HttpStatus.OK)
  async getKycPassport(@Req() req: any, @Query() query: any) {
    const passport = String(query.passport_number || query.passportNumber || '').trim();
    if (!passport) throw new BadRequestException('passport_number query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'passport_verification',
      passport,
      query,
      150,
      () => (isLive ? this.dojahProvider.verifyPassport({ passportNumber: passport, lastName: query.last_name || query.lastName, dob: query.dob || query.date_of_birth }) : this.mockProvider.verifyPassport({ passportNumber: passport, lastName: query.last_name || query.lastName, dob: query.dob || query.date_of_birth }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/passport')
  @HttpCode(HttpStatus.OK)
  async postKycPassport(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const passport = String(payload.passport_number || payload.passportNumber || '').trim();
    if (!passport) throw new BadRequestException('passport_number is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'passport_verification',
      passport,
      payload,
      150,
      () => (isLive ? this.dojahProvider.verifyPassport({ passportNumber: passport, lastName: payload.last_name || payload.lastName, dob: payload.dob || payload.date_of_birth }) : this.mockProvider.verifyPassport({ passportNumber: passport, lastName: payload.last_name || payload.lastName, dob: payload.dob || payload.date_of_birth }))
    );
  }

  // --- 7. Biometrics, AML & Credit Risk ---

  // POST /api/v1/kyc/photoid/verify
  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/photoid/verify')
  @HttpCode(HttpStatus.OK)
  async verifyKycPhotoId(@Req() req: any, @Body() body: any) {
    const idNumber = String(body.id_number || body.idNumber || body.bvn || body.nin || '').trim();
    const selfie = String(body.image || body.selfie_image_base64 || '').trim();
    if (!idNumber || !selfie) throw new BadRequestException('id_number and image (base64) are required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'face_match',
      idNumber,
      body,
      120,
      () => (isLive ? this.dojahProvider.verifyFaceMatch({ idType: body.id_type || 'BVN', idNumber, selfieImageBase64: selfie, livenessCheck: body.liveness_check !== false }) : this.mockProvider.verifyFaceMatch({ idType: body.id_type || 'BVN', idNumber, selfieImageBase64: selfie, livenessCheck: body.liveness_check !== false }))
    );
  }

  // POST /api/v1/aml/screening
  @UseGuards(ApiKeyGuard)
  @Post('v1/aml/screening')
  @HttpCode(HttpStatus.OK)
  async screenAmlDirect(@Req() req: any, @Body() body: any) {
    const name = String(body.name || body.full_name || '').trim();
    if (!name) throw new BadRequestException('name is required for AML screening');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'aml_screening',
      name,
      body,
      150,
      () => (isLive ? this.dojahProvider.screenAml({ name, dob: body.date_of_birth || body.dob, country: body.country || 'NG' }) : this.mockProvider.screenAml({ name, dob: body.date_of_birth || body.dob, country: body.country || 'NG' }))
    );
  }

  // GET & POST /api/v1/credit/bvn
  @UseGuards(ApiKeyGuard)
  @Get('v1/credit/bvn')
  @HttpCode(HttpStatus.OK)
  async getCreditScoreDirect(@Req() req: any, @Query() query: any) {
    const bvn = String(query.bvn || query.id || '').trim();
    if (!bvn) throw new BadRequestException('bvn query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'credit_score',
      bvn,
      query,
      250,
      () => (isLive ? this.dojahProvider.getCreditScore({ bvn, phoneNumber: query.phone_number || query.phoneNumber }) : this.mockProvider.getCreditScore({ bvn, phoneNumber: query.phone_number || query.phoneNumber }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/credit/bvn')
  @HttpCode(HttpStatus.OK)
  async postCreditScoreDirect(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const bvn = String(payload.bvn || payload.id || '').trim();
    if (!bvn) throw new BadRequestException('bvn is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'credit_score',
      bvn,
      payload,
      250,
      () => (isLive ? this.dojahProvider.getCreditScore({ bvn, phoneNumber: payload.phone_number || payload.phoneNumber }) : this.mockProvider.getCreditScore({ bvn, phoneNumber: payload.phone_number || payload.phoneNumber }))
    );
  }

  // GET & POST /api/v1/kyc/email
  @UseGuards(ApiKeyGuard)
  @Get('v1/kyc/email')
  @HttpCode(HttpStatus.OK)
  async getEmailRiskDirect(@Req() req: any, @Query() query: any) {
    const email = String(query.email || '').trim();
    if (!email) throw new BadRequestException('email query parameter is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'email_risk',
      email,
      query,
      30,
      () => (isLive ? this.dojahProvider.checkEmailRisk({ email }) : this.mockProvider.checkEmailRisk({ email }))
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('v1/kyc/email')
  @HttpCode(HttpStatus.OK)
  async postEmailRiskDirect(@Req() req: any, @Body() body: any, @Query() query: any) {
    const payload = { ...query, ...body };
    const email = String(payload.email || '').trim();
    if (!email) throw new BadRequestException('email is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'email_risk',
      email,
      payload,
      30,
      () => (isLive ? this.dojahProvider.checkEmailRisk({ email }) : this.mockProvider.checkEmailRisk({ email }))
    );
  }

  // ==========================================
  // LEGACY ALIAS ENDPOINTS
  // ==========================================

  // 1. POST /api/nin-verification
  @UseGuards(ApiKeyGuard)
  @Post('nin-verification')
  @HttpCode(HttpStatus.OK)
  async verifyNin(@Req() req: any, @Body() body: any) {
    const nin = String(body.nin || body.id || '').trim();
    if (!nin) throw new BadRequestException('NIN is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin',
      nin,
      body,
      95,
      () => (isLive ? this.dojahProvider.verifyNin(body) : this.mockProvider.verifyNin(body))
    );
  }

  // 2. POST /api/bvn-verification
  @UseGuards(ApiKeyGuard)
  @Post('bvn-verification')
  @HttpCode(HttpStatus.OK)
  async verifyBvn(@Req() req: any, @Body() body: any) {
    const bvn = String(body.bvn || body.id || '').trim();
    if (!bvn) throw new BadRequestException('BVN is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'bvn',
      bvn,
      body,
      95,
      () => (isLive ? this.dojahProvider.verifyBvn(body) : this.mockProvider.verifyBvn(body))
    );
  }

  // 3. POST /api/nin-phone
  @UseGuards(ApiKeyGuard)
  @Post('nin-phone')
  @HttpCode(HttpStatus.OK)
  async verifyNinPhone(@Req() req: any, @Body() body: any) {
    const phone = String(body.phone || body.phoneNumber || '').trim();
    if (!phone) throw new BadRequestException('Phone number is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'phone',
      phone,
      body,
      50,
      () => (isLive ? this.dojahProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'advance' }) : this.mockProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'advance' }))
    );
  }

  // 4. POST /api/bvn-phone
  @UseGuards(ApiKeyGuard)
  @Post('bvn-phone')
  @HttpCode(HttpStatus.OK)
  async verifyBvnPhone(@Req() req: any, @Body() body: any) {
    const phone = String(body.phone || body.phoneNumber || '').trim();
    if (!phone) throw new BadRequestException('Phone number is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'phone',
      phone,
      body,
      50,
      () => (isLive ? this.dojahProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'basic' }) : this.mockProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'basic' }))
    );
  }

  // 5. POST /api/nin-demography
  @UseGuards(ApiKeyGuard)
  @Post('nin-demography')
  @HttpCode(HttpStatus.OK)
  async verifyNinDemography(@Req() req: any, @Body() body: any) {
    const nin = String(body.nin || body.id || '').trim();
    if (!nin) throw new BadRequestException('NIN is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin',
      nin,
      body,
      95,
      () => (isLive ? this.dojahProvider.verifyNinAdvance(body) : this.mockProvider.verifyNinAdvance(body))
    );
  }

  // 6. POST /api/nin-tracking
  @UseGuards(ApiKeyGuard)
  @Post('nin-tracking')
  @HttpCode(HttpStatus.OK)
  async verifyNinTracking(@Req() req: any, @Body() body: any) {
    const trackingId = String(body.tracking_id || body.trackingId || body.nin || '').trim();
    if (!trackingId) throw new BadRequestException('Tracking ID is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'nin',
      trackingId,
      body,
      50,
      () => (isLive ? this.dojahProvider.verifyNinAdvance({ nin: trackingId }) : this.mockProvider.verifyNinAdvance({ nin: trackingId }))
    );
  }

  // 7. GET /api/balance (Free)
  @UseGuards(ApiKeyGuard)
  @Get('balance')
  @HttpCode(HttpStatus.OK)
  async getBalance(@Req() req: any) {
    const orgId = req.organizationId;
    const env = req.environment || Environment.SANDBOX;

    let balance = 100000;
    if (orgId) {
      const wallet = await this.walletRepository.findOne({
        where: { org_id: orgId, environment: env },
      });
      if (wallet) {
        balance = wallet.balance;
      }
    }

    return {
      status: 'success',
      data: {
        environment: env,
        currency: 'NGN',
        balance,
        rate: 0,
        is_free: true,
      },
      meta: {
        request_id: `vx_${uuidv4().slice(0, 12)}`,
        latency_ms: 12,
      },
    };
  }

  // 8. POST /api/cac-basic
  @UseGuards(ApiKeyGuard)
  @Post('cac-basic')
  @HttpCode(HttpStatus.OK)
  async verifyCacBasic(@Req() req: any, @Body() body: any) {
    const rc = String(body.rc_number || body.rcNumber || body.id || '').trim();
    if (!rc) throw new BadRequestException('RC / Business number is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'cac_basic',
      rc,
      body,
      120,
      () => (isLive ? this.dojahProvider.verifyCac({ rcNumber: rc, companyType: body.company_type || body.companyType, variant: 'basic' }) : this.mockProvider.verifyCac({ rcNumber: rc, companyType: body.company_type || body.companyType, variant: 'basic' })),
      120
    );
  }

  // 9. POST /api/cac-advance
  @UseGuards(ApiKeyGuard)
  @Post('cac-advance')
  @HttpCode(HttpStatus.OK)
  async verifyCacAdvance(@Req() req: any, @Body() body: any) {
    const rc = String(body.rc_number || body.rcNumber || body.id || '').trim();
    if (!rc) throw new BadRequestException('RC / Business number is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'cac_advance',
      rc,
      body,
      250,
      () => (isLive ? this.dojahProvider.verifyCac({ rcNumber: rc, companyType: body.company_type || body.companyType, variant: 'advance' }) : this.mockProvider.verifyCac({ rcNumber: rc, companyType: body.company_type || body.companyType, variant: 'advance' })),
      250
    );
  }

  // 10. POST /api/tin-verification
  @UseGuards(ApiKeyGuard)
  @Post('tin-verification')
  @HttpCode(HttpStatus.OK)
  async verifyTin(@Req() req: any, @Body() body: any) {
    const tin = String(body.tin || body.tax_id || '').trim();
    if (!tin) throw new BadRequestException('TIN is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'tin_verification',
      tin,
      body,
      90,
      () => (isLive ? this.dojahProvider.verifyTin({ tin }) : this.mockProvider.verifyTin({ tin })),
      90
    );
  }

  // 11. POST /api/drivers-license
  @UseGuards(ApiKeyGuard)
  @Post('drivers-license')
  @HttpCode(HttpStatus.OK)
  async verifyDriversLicense(@Req() req: any, @Body() body: any) {
    const license = String(body.license_number || body.licenseNumber || '').trim();
    if (!license) throw new BadRequestException('Driver\'s License number is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'drivers_license',
      license,
      body,
      95,
      () => (isLive ? this.dojahProvider.verifyDriversLicense({ licenseNumber: license, dob: body.date_of_birth || body.dob }) : this.mockProvider.verifyDriversLicense({ licenseNumber: license, dob: body.date_of_birth || body.dob })),
      95
    );
  }

  // 12. POST /api/voters-card
  @UseGuards(ApiKeyGuard)
  @Post('voters-card')
  @HttpCode(HttpStatus.OK)
  async verifyVotersCard(@Req() req: any, @Body() body: any) {
    const vin = String(body.vin || body.voter_id || '').trim();
    if (!vin) throw new BadRequestException('Voter Identification Number (VIN) is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'voters_card',
      vin,
      body,
      80,
      () => (isLive ? this.dojahProvider.verifyVotersCard({ vin, state: body.state, lastName: body.last_name || body.lastName }) : this.mockProvider.verifyVotersCard({ vin, state: body.state, lastName: body.last_name || body.lastName })),
      80
    );
  }

  // 13. POST /api/passport-verification
  @UseGuards(ApiKeyGuard)
  @Post('passport-verification')
  @HttpCode(HttpStatus.OK)
  async verifyPassport(@Req() req: any, @Body() body: any) {
    const passport = String(body.passport_number || body.passportNumber || '').trim();
    if (!passport) throw new BadRequestException('Passport number is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'passport_verification',
      passport,
      body,
      150,
      () => (isLive ? this.dojahProvider.verifyPassport({ passportNumber: passport, lastName: body.last_name || body.lastName, dob: body.date_of_birth || body.dob }) : this.mockProvider.verifyPassport({ passportNumber: passport, lastName: body.last_name || body.lastName, dob: body.date_of_birth || body.dob })),
      150
    );
  }

  // 14. POST /api/account-resolve (Free / ₦0)
  @UseGuards(ApiKeyGuard)
  @Post('account-resolve')
  @HttpCode(HttpStatus.OK)
  async resolveAccount(@Req() req: any, @Body() body: any) {
    const accountNumber = String(body.account_number || body.accountNumber || '').trim();
    const bankCode = String(body.bank_code || body.bankCode || '').trim();
    if (!accountNumber || !bankCode) throw new BadRequestException('Account number and bank code are required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'account_resolve',
      `${bankCode}_${accountNumber}`,
      body,
      0,
      () => (isLive ? this.dojahProvider.verifyBankAccount({ accountNumber, bankCode }) : this.mockProvider.verifyBankAccount({ accountNumber, bankCode })),
      0
    );
  }

  // 15. POST /api/credit-score
  @UseGuards(ApiKeyGuard)
  @Post('credit-score')
  @HttpCode(HttpStatus.OK)
  async getCreditScore(@Req() req: any, @Body() body: any) {
    const bvn = String(body.bvn || body.id || '').trim();
    if (!bvn) throw new BadRequestException('BVN is required for credit score inquiry');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'credit_score',
      bvn,
      body,
      250,
      () => (isLive ? this.dojahProvider.getCreditScore({ bvn, phoneNumber: body.phone_number || body.phoneNumber }) : this.mockProvider.getCreditScore({ bvn, phoneNumber: body.phone_number || body.phoneNumber })),
      250
    );
  }

  // 16. POST /api/face-match
  @UseGuards(ApiKeyGuard)
  @Post('face-match')
  @HttpCode(HttpStatus.OK)
  async verifyFaceMatch(@Req() req: any, @Body() body: any) {
    const idNumber = String(body.id_number || body.idNumber || body.bvn || body.nin || '').trim();
    const selfie = String(body.selfie_image_base64 || body.image || '').trim();
    if (!idNumber || !selfie) throw new BadRequestException('ID number and selfie image (base64) are required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'face_match',
      idNumber,
      body,
      120,
      () => (isLive ? this.dojahProvider.verifyFaceMatch({ idType: body.id_type || 'BVN', idNumber, selfieImageBase64: selfie, livenessCheck: body.liveness_check !== false }) : this.mockProvider.verifyFaceMatch({ idType: body.id_type || 'BVN', idNumber, selfieImageBase64: selfie, livenessCheck: body.liveness_check !== false })),
      120
    );
  }

  // 17. POST /api/aml-screening
  @UseGuards(ApiKeyGuard)
  @Post('aml-screening')
  @HttpCode(HttpStatus.OK)
  async screenAml(@Req() req: any, @Body() body: any) {
    const name = String(body.name || body.full_name || '').trim();
    if (!name) throw new BadRequestException('Full name is required for AML screening');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'aml_screening',
      name,
      body,
      150,
      () => (isLive ? this.dojahProvider.screenAml({ name, dob: body.date_of_birth || body.dob, country: body.country || 'NG' }) : this.mockProvider.screenAml({ name, dob: body.date_of_birth || body.dob, country: body.country || 'NG' })),
      150
    );
  }

  // 18. POST /api/phone-intelligence
  @UseGuards(ApiKeyGuard)
  @Post('phone-intelligence')
  @HttpCode(HttpStatus.OK)
  async screenPhoneIntelligence(@Req() req: any, @Body() body: any) {
    const phone = String(body.phone_number || body.phone || '').trim();
    if (!phone) throw new BadRequestException('Phone number is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'phone_intelligence',
      phone,
      body,
      95,
      () => (isLive ? this.dojahProvider.screenPhoneIntelligence({ phoneNumber: phone }) : this.mockProvider.screenPhoneIntelligence({ phoneNumber: phone })),
      95
    );
  }

  // 19. POST /api/email-risk
  @UseGuards(ApiKeyGuard)
  @Post('email-risk')
  @HttpCode(HttpStatus.OK)
  async checkEmailRisk(@Req() req: any, @Body() body: any) {
    const email = String(body.email || '').trim();
    if (!email) throw new BadRequestException('Email address is required');
    const isLive = req.environment === Environment.LIVE;
    return this.executeVerification(
      req,
      'email_risk',
      email,
      body,
      30,
      () => (isLive ? this.dojahProvider.checkEmailRisk({ email }) : this.mockProvider.checkEmailRisk({ email })),
      30
    );
  }

  // 20. POST /api/telecom/airtime (Automated VTU)
  @UseGuards(ApiKeyGuard)
  @Post('telecom/airtime')
  @HttpCode(HttpStatus.OK)
  async purchaseAirtime(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for telecom transaction (consent: true).');
    }
    const phone = String(body.phone_number || body.phone || body.destination || '').trim();
    const amount = Number(body.amount);
    if (!phone || !amount || isNaN(amount)) throw new BadRequestException('Valid phone number and amount are required');
    const isLive = req.environment === Environment.LIVE;
    const res = isLive ? await this.dojahProvider.purchaseAirtime({ amount, destination: phone }) : await this.mockProvider.purchaseAirtime({ amount, destination: phone });
    return {
      status: 'success',
      data: res,
      billed_amount: amount,
      meta: {
        request_id: `vx_${uuidv4().slice(0, 12)}`,
        service: 'telecom_airtime',
        environment: req.environment || Environment.SANDBOX,
      },
    };
  }

  // 21. POST /api/telecom/data (Automated Mobile Data)
  @UseGuards(ApiKeyGuard)
  @Post('telecom/data')
  @HttpCode(HttpStatus.OK)
  async purchaseData(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for telecom transaction (consent: true).');
    }
    const phone = String(body.phone_number || body.phone || body.destination || '').trim();
    const plan = String(body.plan || body.plan_code || '').trim();
    if (!phone || !plan) throw new BadRequestException('Phone number and data plan code are required');
    const isLive = req.environment === Environment.LIVE;
    const res = isLive ? await this.dojahProvider.purchaseData({ plan, destination: phone }) : await this.mockProvider.purchaseData({ plan, destination: phone });
    return {
      status: 'success',
      data: res,
      meta: {
        request_id: `vx_${uuidv4().slice(0, 12)}`,
        service: 'telecom_data',
        environment: req.environment || Environment.SANDBOX,
      },
    };
  }

  // 22. POST /api/messaging/send-otp (Transactional SMS / WhatsApp OTP)
  @UseGuards(ApiKeyGuard)
  @Post('messaging/send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for message dispatch (consent: true).');
    }
    const destination = String(body.destination || body.phone_number || '').trim();
    const message = String(body.message || '').trim();
    if (!destination || !message) throw new BadRequestException('Destination and message content are required');
    const isLive = req.environment === Environment.LIVE;
    const res = isLive ? await this.dojahProvider.sendSms(body) : await this.mockProvider.sendSms(body);
    return {
      status: 'success',
      data: res,
      meta: {
        request_id: `vx_${uuidv4().slice(0, 12)}`,
        service: 'messaging_otp',
        environment: req.environment || Environment.SANDBOX,
      },
    };
  }
}
