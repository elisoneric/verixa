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
    service: 'bvn' | 'nin' | 'phone',
    identifier: string,
    payload: any,
    baseRate: number,
    queryFn: () => Promise<any>
  ) {
    const orgId = req.organizationId;
    const env = req.environment || Environment.SANDBOX;
    const isLive = env === Environment.LIVE;
    const startTime = Date.now();
    const reducedPrice = Math.max(0, baseRate - 15);

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
}
