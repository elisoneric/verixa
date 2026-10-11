import {
  Controller,
  Post,
  Get,
  Body,
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
import { Environment } from '../organizations/entities/environment-config.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationLog, VerificationStatus } from './entities/verification-log.entity';
import { Wallet } from '../billing/entities/wallet.entity';
import { v4 as uuidv4 } from 'uuid';

@Controller('api')
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

  private async executeVerification(
    req: any,
    service: string,
    identifier: string,
    payload: any,
    baseRate: number,
    queryFn: () => Promise<any>,
    exactPrice?: number,
  ) {
    if (payload?.consent !== true && payload?.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }

    const orgId = req.organizationId;
    const env = req.environment || Environment.SANDBOX;
    const isLive = env === Environment.LIVE;
    const startTime = Date.now();
    const reducedPrice = exactPrice !== undefined ? exactPrice : Math.max(0, baseRate - 15);

    // 1. Check Smart Identity Cache
    if (identifier) {
      const cached = await this.identityCacheService.getCachedRecord(
        orgId,
        env,
        service,
        identifier,
      );

      if (cached) {
        const cacheCost = Math.max(10, Math.round(reducedPrice * 0.4));
        const reference = `vx_cache_${uuidv4().slice(0, 12)}`;

        if (orgId) {
          try {
            await this.billingService.deductCredits(orgId, env, cacheCost, reference);
          } catch {
            // allow continue
          }
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
          responsePayload: cached.data,
        });

        return {
          status: 'success',
          data: cached.data,
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
    }

    // 2. Query Primary Gateway
    let result: any;
    try {
      result = await queryFn();
    } catch (err: any) {
      throw new BadRequestException(err.message || `Failed to verify ${service}`);
    }

    const reference = `vx_live_${uuidv4().slice(0, 12)}`;

    // 3. Deduct dropped rate (reduced by ₦15)
    if (orgId) {
      try {
        await this.billingService.deductCredits(orgId, env, reducedPrice, reference);
      } catch {
        // proceed
      }
    }

    // 4. Cache verified record
    if (identifier && result?.data) {
      await this.identityCacheService.setCachedRecord(orgId, env, service, identifier, result.data, 'direct');
    }

    const latencyMs = Math.max(35, Date.now() - startTime);

    await this.logRepository.save({
      org_id: orgId,
      environment: env,
      api_key_id: req.apiKeyId || 'api_key',
      serviceType: service,
      status: VerificationStatus.SUCCESS,
      upstreamProvider: 'direct',
      isCached: false,
      source: 'LIVE',
      costDeducted: reducedPrice,
      latencyMs,
      cacheKey: this.identityCacheService.generateKey(orgId, env, service, identifier),
      idempotencyKey: req.headers?.['idempotency-key'] || undefined,
      requestPayload: payload,
      responsePayload: result?.data || result,
    });

    return {
      status: 'success',
      data: result?.data || result,
      billed_amount: reducedPrice,
      cached: false,
      meta: {
        request_id: reference,
        service,
        latency_ms: latencyMs,
        environment: env,
      },
    };
  }

  // 1. POST /api/nin-verification (Standard ₦150 -> Dropped by ₦15: ₦135)
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
      150,
      () => (isLive ? this.dojahProvider.verifyNin(body) : this.mockProvider.verifyNin(body))
    );
  }

  // 2. POST /api/bvn-verification (Standard ₦100 -> Dropped by ₦15: ₦85)
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
      100,
      () => (isLive ? this.dojahProvider.verifyBvn(body) : this.mockProvider.verifyBvn(body))
    );
  }

  // 3. POST /api/nin-phone (Standard ₦200 -> Dropped by ₦15: ₦185)
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
      200,
      () => (isLive ? this.dojahProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'advance' }) : this.mockProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'advance' }))
    );
  }

  // 4. POST /api/bvn-phone (Standard ₦150 -> Dropped by ₦15: ₦135)
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
      150,
      () => (isLive ? this.dojahProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'basic' }) : this.mockProvider.verifyPhoneNumber({ phoneNumber: phone, variant: 'basic' }))
    );
  }

  // 5. POST /api/nin-demography (Standard ₦250 -> Dropped by ₦15: ₦235)
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
      250,
      () => (isLive ? this.dojahProvider.verifyNinAdvance(body) : this.mockProvider.verifyNinAdvance(body))
    );
  }

  // 6. POST /api/nin-tracking (Standard ₦200 -> Dropped by ₦15: ₦185)
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
      200,
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

  // 8. POST /api/cac-basic (Benchmark ₦250 -> Verixa ₦220)
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
      250,
      () => (isLive ? this.dojahProvider.verifyCac({ rcNumber: rc, companyType: body.company_type || body.companyType, variant: 'basic' }) : this.mockProvider.verifyCac({ rcNumber: rc, companyType: body.company_type || body.companyType, variant: 'basic' })),
      220
    );
  }

  // 9. POST /api/cac-advance (Benchmark ₦600 -> Verixa ₦540)
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
      600,
      () => (isLive ? this.dojahProvider.verifyCac({ rcNumber: rc, companyType: body.company_type || body.companyType, variant: 'advance' }) : this.mockProvider.verifyCac({ rcNumber: rc, companyType: body.company_type || body.companyType, variant: 'advance' })),
      540
    );
  }

  // 10. POST /api/tin-verification (Benchmark ₦200 -> Verixa ₦180)
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
      200,
      () => (isLive ? this.dojahProvider.verifyTin({ tin }) : this.mockProvider.verifyTin({ tin })),
      180
    );
  }

  // 11. POST /api/drivers-license (Benchmark ₦180 -> Verixa ₦160)
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
      180,
      () => (isLive ? this.dojahProvider.verifyDriversLicense({ licenseNumber: license, dob: body.date_of_birth || body.dob }) : this.mockProvider.verifyDriversLicense({ licenseNumber: license, dob: body.date_of_birth || body.dob })),
      160
    );
  }

  // 12. POST /api/voters-card (Benchmark ₦150 -> Verixa ₦130)
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
      150,
      () => (isLive ? this.dojahProvider.verifyVotersCard({ vin, state: body.state, lastName: body.last_name || body.lastName }) : this.mockProvider.verifyVotersCard({ vin, state: body.state, lastName: body.last_name || body.lastName })),
      130
    );
  }

  // 13. POST /api/passport-verification (Benchmark ₦300 -> Verixa ₦270)
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
      300,
      () => (isLive ? this.dojahProvider.verifyPassport({ passportNumber: passport, lastName: body.last_name || body.lastName, dob: body.date_of_birth || body.dob }) : this.mockProvider.verifyPassport({ passportNumber: passport, lastName: body.last_name || body.lastName, dob: body.date_of_birth || body.dob })),
      270
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

  // 15. POST /api/credit-score (Benchmark ₦450 -> Verixa ₦390)
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
      450,
      () => (isLive ? this.dojahProvider.getCreditScore({ bvn, phoneNumber: body.phone_number || body.phoneNumber }) : this.mockProvider.getCreditScore({ bvn, phoneNumber: body.phone_number || body.phoneNumber })),
      390
    );
  }

  // 16. POST /api/face-match (Benchmark ₦250 -> Verixa ₦220)
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
      250,
      () => (isLive ? this.dojahProvider.verifyFaceMatch({ idType: body.id_type || 'BVN', idNumber, selfieImageBase64: selfie, livenessCheck: body.liveness_check !== false }) : this.mockProvider.verifyFaceMatch({ idType: body.id_type || 'BVN', idNumber, selfieImageBase64: selfie, livenessCheck: body.liveness_check !== false })),
      220
    );
  }

  // 17. POST /api/aml-screening (Benchmark ₦200 -> Verixa ₦175)
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
      200,
      () => (isLive ? this.dojahProvider.screenAml({ name, dob: body.date_of_birth || body.dob, country: body.country || 'NG' }) : this.mockProvider.screenAml({ name, dob: body.date_of_birth || body.dob, country: body.country || 'NG' })),
      175
    );
  }

  // 18. POST /api/phone-intelligence (Benchmark ₦150 -> Verixa ₦130)
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
      150,
      () => (isLive ? this.dojahProvider.screenPhoneIntelligence({ phoneNumber: phone }) : this.mockProvider.screenPhoneIntelligence({ phoneNumber: phone })),
      130
    );
  }

  // 19. POST /api/email-risk (Benchmark ₦80 -> Verixa ₦65)
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
      80,
      () => (isLive ? this.dojahProvider.checkEmailRisk({ email }) : this.mockProvider.checkEmailRisk({ email })),
      65
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
