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
import { BillingService } from '../billing/billing.service';
import { IdentityCacheService } from '../verifications/identity-cache.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationLog, VerificationStatus } from '../verifications/entities/verification-log.entity';
import { v4 as uuidv4 } from 'uuid';

@Controller('v1')
export class NinSlipController {
  constructor(
    private ninSlipService: NinSlipService,
    private dojahProvider: DojahProvider,
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
    const format = body.format || 'pdf';
    return this.ninSlipService.generateSlipForOrganization(
      req.organizationId,
      req.environment,
      nin,
      format,
      req.apiKeyId,
    );
  }

  // 2. JWT Authenticated Endpoint (for Dashboard UI generator)
  @UseGuards(JwtAuthGuard)
  @Post('dashboard/slips/nin')
  async generateSlipDashboard(@Req() req: any, @Body() body: any) {
    if (body.consent !== true && body.consent !== 'true') {
      throw new BadRequestException('Applicant consent is mandatory for regulatory identity lookup (consent: true).');
    }
    const nin = String(body.nin || '').trim();
    const format = body.format || 'both';
    return this.ninSlipService.generateSlipForOrganization(
      req.organizationId,
      req.environment || 'live',
      nin,
      format,
      'dashboard_ui',
    );
  }

  // 3. Direct File Download Endpoint (PDF or DOCX)
  @UseGuards(JwtAuthGuard)
  @Get('dashboard/slips/nin/:nin/download')
  async downloadSlip(
    @Req() req: any,
    @Param('nin') nin: string,
    @Query('format') format: 'pdf' | 'docx' = 'pdf',
    @Res() res: Response,
  ) {
    const cleanNin = String(nin || '').replace(/\D/g, '');
    const result = await this.ninSlipService.generateSlipForOrganization(
      req.organizationId,
      req.environment || 'live',
      cleanNin,
      format,
      'dashboard_download',
    );

    if (format === 'docx' && result.data.docxBuffer) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="NIN_Slip_${cleanNin}.docx"`);
      return res.send(result.data.docxBuffer);
    }

    if (result.data.pdfBuffer) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="NIN_Slip_${cleanNin}.pdf"`);
      return res.send(result.data.pdfBuffer);
    }

    throw new BadRequestException('Requested format could not be generated');
  }

  // 4. NIN Advance Verification Endpoint (API Key - ₦140)
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

    await this.billingService.deductCredits(req.organizationId, req.environment, cost, reference);

    try {
      const result = await this.dojahProvider.verifyNinAdvance({ nin });
      const latencyMs = Math.max(90, Date.now() - startTime);

      await this.logRepository.save({
        org_id: req.organizationId,
        environment: req.environment,
        api_key_id: req.apiKeyId || 'sdk_key',
        serviceType: 'nin_advance',
        status: result.status === 'success' ? VerificationStatus.SUCCESS : VerificationStatus.FAILED,
        upstreamProvider: result.meta?.provider || 'dojah',
        isCached: false,
        source: 'LIVE',
        costDeducted: cost,
        latencyMs,
        requestPayload: { nin },
        responsePayload: result.data || null,
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
}
