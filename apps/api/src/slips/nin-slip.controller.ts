import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NinSlipService } from './nin-slip.service';
import { DojahProvider } from '../verifications/providers/dojah.provider';
import { MockProvider } from '../verifications/providers/mock.provider';
import { BillingService } from '../billing/billing.service';
import { IdentityCacheService } from '../verifications/identity-cache.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationLog, VerificationStatus } from '../verifications/entities/verification-log.entity';
import { normalizeEnvironment, Environment } from '../organizations/entities/environment-config.entity';
import { v4 as uuidv4 } from 'uuid';
import { encryptPayload, sanitizeIdentityRetention } from '../common/utils/crypto.util';

@Controller(['v1', 'api/v1'])
export class NinSlipController {
  constructor(
    private ninSlipService: NinSlipService,
    private dojahProvider: DojahProvider,
    private mockProvider: MockProvider,
    private billingService: BillingService,
    private identityCacheService: IdentityCacheService,
    @InjectRepository(VerificationLog)
    private logRepository: Repository<VerificationLog>,
  ) {}

  // 1. API Key Authenticated Endpoint (for programmatic developers / Trust Bricks SDK)
  @UseGuards(ApiKeyGuard)
  @Post('slips/nin')
  async generateSlipApiKey(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const nin = String(body.nin || '').trim();
    const requestedFormat = String(body.format || '').toLowerCase();
    const cardType: 'card' | 'slip' = body.cardType || body.type || (requestedFormat === 'card' ? 'card' : 'slip');
    const fileType = body.fileType || (requestedFormat === 'docx' ? 'docx' : (requestedFormat === 'pdf' ? 'pdf' : 'both'));

    return this.ninSlipService.generateSlipForOrganization(
      req.organizationId,
      normalizeEnvironment(req.environment),
      nin,
      fileType,
      req.apiKeyId,
      cardType,
    );
  }

  // 1a. Fast Identity Lookup Endpoint (API Key - instant optimistic demographic fetch)
  @UseGuards(ApiKeyGuard)
  @Post('slips/nin/lookup')
  async lookupSlipApiKey(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const nin = String(body.nin || '').trim();
    return this.ninSlipService.lookupIdentity(
      req.organizationId,
      normalizeEnvironment(req.environment),
      nin,
    );
  }

  // 1b. Dedicated Digital NIN Card Endpoint (ID-1 Format without address)
  @UseGuards(ApiKeyGuard)
  @Post('slips/nin/card')
  async generateCardPostApiKey(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const nin = String(body.nin || '').trim();
    return this.ninSlipService.generateSlipForOrganization(
      req.organizationId,
      normalizeEnvironment(req.environment),
      nin,
      'pdf',
      req.apiKeyId,
      'card',
    );
  }

  @UseGuards(ApiKeyGuard)
  @Get('slips/nin/card')
  async generateCardGetApiKey(@Req() req: any, @Query() query: any) {
    if (query.consent !== true && query.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const nin = String(query.nin || '').trim();
    return this.ninSlipService.generateSlipForOrganization(
      req.organizationId,
      normalizeEnvironment(req.environment),
      nin,
      'pdf',
      req.apiKeyId,
      'card',
    );
  }

  // 2a. Fast Identity Lookup Endpoint (JWT - instant optimistic demographic fetch for dashboard UI)
  @UseGuards(JwtAuthGuard)
  @Post('dashboard/slips/nin/lookup')
  async lookupSlipDashboard(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const nin = String(body.nin || '').trim();
    return this.ninSlipService.lookupIdentity(
      req.organizationId,
      normalizeEnvironment(req.environment || 'live'),
      nin,
    );
  }

  // 2b. JWT Authenticated Endpoint (for Dashboard UI generator)
  @UseGuards(JwtAuthGuard)
  @Post('dashboard/slips/nin')
  async generateSlipDashboard(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const nin = String(body.nin || '').trim();
    const requestedFormat = String(body.format || '').toLowerCase();
    const cardType: 'card' | 'slip' = body.cardType || body.type || (requestedFormat === 'card' ? 'card' : 'slip');
    const fileType = body.fileType || (requestedFormat === 'docx' ? 'docx' : (requestedFormat === 'pdf' ? 'pdf' : 'both'));

    return this.ninSlipService.generateSlipForOrganization(
      req.organizationId,
      normalizeEnvironment(req.environment || 'live'),
      nin,
      fileType,
      'dashboard_ui',
      cardType,
    );
  }

  // 3. Direct File Download Endpoint (PDF, DOCX, or CARD)
  @UseGuards(JwtAuthGuard)
  @Get('dashboard/slips/nin/:nin/download')
  async downloadSlip(
    @Req() req: any,
    @Param('nin') nin: string,
    @Query('format') format: 'pdf' | 'docx' | 'card' = 'pdf',
    @Query('type') type?: 'card' | 'slip',
    @Res() res?: Response,
  ) {
    const cleanNin = String(nin || '').replace(/\D/g, '');
    const isCard = format === 'card' || type === 'card';
    const result = await this.ninSlipService.generateSlipForOrganization(
      req.organizationId,
      normalizeEnvironment(req.environment || 'live'),
      cleanNin,
      'both',
      'dashboard_download',
      isCard ? 'card' : 'slip',
    );

    if (format === 'docx' && result.data.docxBuffer) {
      res!.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res!.setHeader('Content-Disposition', `attachment; filename="NIN_Slip_${cleanNin}.docx"`);
      return res!.send(result.data.docxBuffer);
    }

    if (isCard && result.data.cardPdfBuffer) {
      res!.setHeader('Content-Type', 'application/pdf');
      res!.setHeader('Content-Disposition', `attachment; filename="NIN_Digital_Card_${cleanNin}.pdf"`);
      return res!.send(result.data.cardPdfBuffer);
    }

    if (result.data.pdfBuffer) {
      res!.setHeader('Content-Type', 'application/pdf');
      res!.setHeader('Content-Disposition', `attachment; filename="NIN_Slip_${cleanNin}.pdf"`);
      return res!.send(result.data.pdfBuffer);
    }

    throw new BadRequestException('Requested format could not be generated');
  }


  // 4. NIN Advance Verification Endpoint (API Key - ₦95)
  @UseGuards(ApiKeyGuard)
  @Post('verify/nin/advance')
  async verifyNinAdvance(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const nin = String(body.nin || '').trim();
    if (nin.length !== 11) {
      throw new BadRequestException('A valid 11-digit NIN is required');
    }

    const startTime = Date.now();
    const rateInfo = await this.billingService.getEffectiveRate(req.organizationId, 'nin_advance' as any, false);
    const cost = rateInfo.effectiveRate;
    const reference = `vx_adv_${uuidv4().slice(0, 12)}`;

    const env = normalizeEnvironment(req.environment);
    await this.billingService.deductCredits(req.organizationId, env, cost, reference);

    try {
      const isLive = env === Environment.LIVE && nin !== '70123456789' && nin !== '11234567890';
      const provider = isLive ? this.dojahProvider : this.mockProvider;
      const result = await provider.verifyNinAdvance({ nin });
      const latencyMs = Math.max(90, Date.now() - startTime);

      await this.logRepository.save({
        org_id: req.organizationId,
        environment: env,
        api_key_id: req.apiKeyId || 'sdk_key',
        serviceType: 'nin_advance',
        status: result.status === 'success' ? VerificationStatus.SUCCESS : VerificationStatus.FAILED,
        upstreamProvider: result.meta?.provider || (isLive ? 'direct' : 'verixa_mock'),
        isCached: false,
        source: isLive ? 'LIVE' : 'SANDBOX',
        costDeducted: cost,
        latencyMs,
        requestPayload: { nin },
        responsePayload: result.data ? encryptPayload(sanitizeIdentityRetention(result.data)) : null,
      });

      return {
        ...result,
        meta: {
          ...result.meta,
          cost_ngx: cost,
          referenceId: reference,
          latency_ms: latencyMs,
        },
      };
    } catch (err: any) {
      await this.billingService.refundCredits(req.organizationId, req.environment, cost, reference);
      throw err;
    }
  }

  // 5. On-Demand Document Synthesis Endpoint (F17)
  @UseGuards(ApiKeyGuard)
  @Post('slips/on-demand')
  async generateOnDemandSlip(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: any,
  ) {
    if (!body || !body.logId) {
      throw new BadRequestException('logId is required in request body');
    }

    const format = (body.format || 'slip').toLowerCase();
    const fileType = (body.fileType || 'pdf').toLowerCase();

    const result = await this.ninSlipService.generateOnDemandSlip({
      logId: body.logId,
      format,
      fileType,
      organizationId: req.organizationId,
      environment: req.environment,
    });

    const isJsonRequested =
      body.json === true ||
      body.json === 'true' ||
      (req.headers.accept && req.headers.accept.includes('application/json'));

    if (isJsonRequested) {
      return res.status(200).json({
        success: true,
        filename: result.filename,
        contentType: result.contentType,
        sizeBytes: result.sizeBytes,
        base64: result.buffer.toString('base64'),
      });
    }

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.sizeBytes);
    return res.status(200).send(result.buffer);
  }
}
