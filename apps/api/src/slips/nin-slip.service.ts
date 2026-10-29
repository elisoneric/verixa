import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DojahProvider } from '../verifications/providers/dojah.provider';
import { MockProvider } from '../verifications/providers/mock.provider';
import { IdentityCacheService } from '../verifications/identity-cache.service';
import { BillingService } from '../billing/billing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationLog, VerificationStatus } from '../verifications/entities/verification-log.entity';
import { Environment, normalizeEnvironment } from '../organizations/entities/environment-config.entity';
import { NinAdvanceResult } from '../verifications/providers/verification.provider.interface';
import {
  generateDocxSlip,
  generatePdfSlip,
  generateDigitalNinCardPdf,
  generateDigitalNinCardSvg,
  generatePaperSlipSvg,
  getSlipAssetPath,
  resolveSlipPhotoBuffer,
  generateNimcCard,
  generateStandardNinSlip,
  SlipData,
} from './slip-generator.util';
import { encryptPayload, decryptPayload, sanitizeIdentityRetention } from '../common/utils/crypto.util';


@Injectable()
export class NinSlipService {
  private readonly logger = new Logger(NinSlipService.name);

  constructor(
    private dojahProvider: DojahProvider,
    private mockProvider: MockProvider,
    private identityCacheService: IdentityCacheService,
    private billingService: BillingService,
    @InjectRepository(VerificationLog)
    private logRepository: Repository<VerificationLog>,
  ) {}

  async generateDocx(data: NinAdvanceResult): Promise<Buffer> {
    try {
      return await generateDocxSlip(data);
    } catch (err: any) {
      throw new InternalServerErrorException(`DOCX generation error: ${err?.message}`);
    }
  }

  async generatePdf(data: NinAdvanceResult): Promise<Buffer> {
    try {
      return await generatePdfSlip(data);
    } catch (err: any) {
      throw new InternalServerErrorException(`PDF generation error: ${err?.message}`);
    }
  }

  async generateCardPdf(data: NinAdvanceResult): Promise<Buffer> {
    try {
      return await generateDigitalNinCardPdf(data);
    } catch (err: any) {
      throw new InternalServerErrorException(`Card PDF generation error: ${err?.message}`);
    }
  }

  async generateCardSvg(data: NinAdvanceResult): Promise<string> {
    try {
      return await generateDigitalNinCardSvg(data);
    } catch (err: any) {
      throw new InternalServerErrorException(`Card SVG generation error: ${err?.message}`);
    }
  }

  async generatePaperSvg(data: NinAdvanceResult): Promise<string> {
    try {
      return await generatePaperSlipSvg(data);
    } catch (err: any) {
      throw new InternalServerErrorException(`Paper Slip SVG generation error: ${err?.message}`);
    }
  }

  async lookupIdentity(orgId: string, environment: Environment, nin: string) {
    const cleanNin = String(nin || '').replace(/\D/g, '');
    if (cleanNin.length !== 11) {
      throw new BadRequestException('A valid 11-digit NIN is required');
    }

    const validEnv = normalizeEnvironment(environment);
    const isSandbox = validEnv === Environment.SANDBOX || cleanNin === '70123456789' || cleanNin === '11234567890';
    const provider = isSandbox ? this.mockProvider : this.dojahProvider;
    const startTime = Date.now();

    // 1. Check Smart Identity Cache
    const cached = await this.identityCacheService.getCachedRecord(
      orgId,
      validEnv,
      'nin',
      cleanNin,
    );

    let identityData: NinAdvanceResult | null = null;
    let isCacheHit = false;
    let cost = 0;
    const reference = `vx_look_${uuidv4().slice(0, 12)}`;

    if (cached && cached.data?.photo) {
      isCacheHit = true;
      const rateInfo = await this.billingService.getEffectiveRate(orgId, 'nin' as any, true);
      cost = rateInfo.effectiveRate;
      await this.billingService.deductCredits(orgId, validEnv, cost, reference);
      identityData = cached.data;
    } else {
      const rateInfo = await this.billingService.getEffectiveRate(orgId, 'nin' as any, false);
      cost = rateInfo.effectiveRate;
      await this.billingService.deductCredits(orgId, validEnv, cost, reference);

      try {
        let upstreamProviderName = isSandbox ? 'verixa_mock' : 'direct';
        // Try NIN Slip lookup
        try {
          const slipRes = await provider.verifyNin({ nin: cleanNin, tier: 'slip' });
          if (slipRes.status === 'success' && slipRes.data) {
            const s = slipRes.data;
            let photoStr = s.photo || '';
            if (photoStr.includes('base64,')) {
              photoStr = photoStr.split('base64,')[1];
            }
            identityData = {
              nin: cleanNin,
              trackingId: s.tracking_id || s.trackingId || '',
              firstName: s.first_name || s.firstname || '',
              surname: s.last_name || s.surname || '',
              middleName: s.middle_name || s.middlename || '',
              gender: (s.gender || 'MALE').toUpperCase(),
              birthdate: s.date_of_birth || s.birthdate || s.dob || '',
              address: s.residence_address_line_1 || s.residence_address || s.address || '',
              addressLine1: s.residence_lga || s.birth_lga || s.lga || s.addressLine1 || '',
              state: s.residence_state || s.birth_state || s.state || '',
              lga: s.residence_lga || s.birth_lga || s.lga || '',
              phoneNumber: s.phone_number || s.telephoneno || '',
              photo: photoStr,
              signature: s.signature || '',
              employment_status: s.employment_status,
              marital_status: s.marital_status,
              height: s.height,
              nin_id: s.nin_id,
            };
            upstreamProviderName = slipRes.meta?.provider || (isSandbox ? 'verixa_mock' : 'direct');
          }
        } catch {}

        if (!identityData) {
          try {
            const advRes = await provider.verifyNinAdvance({ nin: cleanNin });
            if (advRes.status === 'success' && advRes.data) {
              identityData = advRes.data;
              upstreamProviderName = advRes.meta?.provider || (isSandbox ? 'verixa_mock' : 'direct');
            }
          } catch {}
        }

        if (!identityData) {
          const basicRes = await provider.verifyNin({ nin: cleanNin });
          if (basicRes.status !== 'success' || !basicRes.data) {
            throw new BadRequestException('NIN verification failed or record not found');
          }
          const b = basicRes.data;
          let photoStr = b.photo || '';
          if (photoStr.includes('base64,')) {
            photoStr = photoStr.split('base64,')[1];
          }
          identityData = {
            nin: cleanNin,
            trackingId: b.tracking_id || b.trackingId || '',
            firstName: b.firstname || b.first_name || '',
            surname: b.surname || b.last_name || '',
            middleName: b.middlename || b.middle_name || '',
            gender: (b.gender || 'MALE').toUpperCase(),
            birthdate: b.birthdate || b.date_of_birth || b.dob || '',
            address: b.residence_address_line_1 || b.residence_address || b.address || '',
            addressLine1: b.residence_lga || b.birth_lga || b.lga || b.residence_town || b.addressLine1 || '',
            state: b.residence_state || b.birth_state || b.state || '',
            lga: b.residence_lga || b.birth_lga || b.lga || '',
            phoneNumber: b.telephoneno || b.phone_number || '',
            photo: photoStr,
            signature: b.signature || '',
          };
          upstreamProviderName = basicRes.meta?.provider || (isSandbox ? 'verixa_mock' : 'direct');
        }

        await this.identityCacheService.setCachedRecord(
          orgId,
          validEnv,
          'nin',
          cleanNin,
          identityData,
          upstreamProviderName,
        );
      } catch (err: any) {
        await this.billingService.refundCredits(orgId, validEnv, cost, reference);
        throw err;
      }
    }

    if (!identityData) {
      throw new BadRequestException('Failed to retrieve verified NIN data');
    }

    const latencyMs = Math.max(70, Date.now() - startTime);
    const fullName = [identityData.surname, identityData.firstName, identityData.middleName].filter(Boolean).join(' ');

    return {
      success: true,
      status: 'success',
      trackingId: identityData.trackingId,
      fullName,
      firstName: identityData.firstName,
      surname: identityData.surname,
      middleName: identityData.middleName,
      gender: identityData.gender,
      birthdate: identityData.birthdate,
      nin: cleanNin,
      photoBase64: identityData.photo || null,
      data: {
        nin: cleanNin,
        trackingId: identityData.trackingId,
        fullName,
        firstName: identityData.firstName,
        surname: identityData.surname,
        middleName: identityData.middleName,
        gender: identityData.gender,
        birthdate: identityData.birthdate,
        photoBase64: identityData.photo || null,
      },
      meta: {
        cached: isCacheHit,
        cost_ngx: cost,
        referenceId: reference,
        latency_ms: latencyMs,
      },
    };
  }


  async generateSlipForOrganization(
    orgId: string,
    environment: Environment,
    nin: string,
    format: 'pdf' | 'docx' | 'both' | 'card' | 'slip' | string = 'pdf',
    apiKeyId?: string,
    cardType: 'slip' | 'card' = 'slip',
  ) {

    const cleanNin = String(nin || '').replace(/\D/g, '');
    if (cleanNin.length !== 11) {
      throw new BadRequestException('A valid 11-digit NIN is required');
    }

    const validEnv = normalizeEnvironment(environment);
    const isSandbox = validEnv === Environment.SANDBOX || cleanNin === '70123456789' || cleanNin === '11234567890';
    const provider = isSandbox ? this.mockProvider : this.dojahProvider;
    const startTime = Date.now();

    // 1. Check Smart Identity Cache for existing NIN record
    const cached = await this.identityCacheService.getCachedRecord(
      orgId,
      validEnv,
      'nin',
      cleanNin,
    );

    let identityData: NinAdvanceResult | null = null;
    let isCacheHit = false;
    let cost = 0;
    const reference = `vx_slip_${uuidv4().slice(0, 12)}`;

    if (cached && cached.data?.photo) {
      // CACHE HIT! Discounted rate for regenerating existing verified slip
      isCacheHit = true;
      const rateInfo = await this.billingService.getEffectiveRate(orgId, 'nin_slip' as any, true);
      cost = rateInfo.effectiveRate;
      await this.billingService.deductCredits(orgId, validEnv, cost, reference);
      identityData = cached.data;
    } else {
      // CACHE MISS: Live or Sandbox NIN Query
      const rateInfo = await this.billingService.getEffectiveRate(orgId, 'nin_slip' as any, false);
      cost = rateInfo.effectiveRate;
      await this.billingService.deductCredits(orgId, validEnv, cost, reference);

      try {
        let upstreamProviderName = isSandbox ? 'verixa_mock' : 'direct';

        // 1. Try NIN Slip lookup (full NDPC dataset + photo + tracking ID)
        try {
          const slipRes = await provider.verifyNin({ nin: cleanNin, tier: 'slip' });
          if (slipRes.status === 'success' && slipRes.data) {
            const s = slipRes.data;
            let photoStr = s.photo || '';
            if (photoStr.includes('base64,')) {
              photoStr = photoStr.split('base64,')[1];
            }
            identityData = {
              nin: cleanNin,
              trackingId: s.tracking_id || s.trackingId || '',
              firstName: s.first_name || s.firstname || '',
              surname: s.last_name || s.surname || '',
              middleName: s.middle_name || s.middlename || '',
              gender: (s.gender || 'MALE').toUpperCase(),
              birthdate: s.date_of_birth || s.birthdate || s.dob || '',
              address: s.residence_address_line_1 || s.residence_address || s.address || '',
              addressLine1: s.residence_lga || s.birth_lga || s.lga || s.addressLine1 || '',
              state: s.residence_state || s.birth_state || s.state || '',
              lga: s.residence_lga || s.birth_lga || s.lga || '',
              phoneNumber: s.phone_number || s.telephoneno || '',
              photo: photoStr,
              signature: s.signature || '',
              employment_status: s.employment_status,
              marital_status: s.marital_status,
              height: s.height,
              nin_id: s.nin_id,
            };
            upstreamProviderName = slipRes.meta?.provider || (isSandbox ? 'verixa_mock' : 'direct');
          }
        } catch (slipErr: any) {
          this.logger.warn(`verifyNin slip attempt failed: ${slipErr?.message}, falling back to verifyNinAdvance`);
        }

        // 2. Fall back to Advance NIN lookup
        if (!identityData) {
          try {
            const upstreamRes = await provider.verifyNinAdvance({ nin: cleanNin });
            if (upstreamRes.status === 'success' && upstreamRes.data) {
              identityData = upstreamRes.data;
              upstreamProviderName = upstreamRes.meta?.provider || (isSandbox ? 'verixa_mock' : 'direct');
            }
          } catch (advErr: any) {
            this.logger.warn(`verifyNinAdvance attempt failed: ${advErr?.message}, falling back to verifyNin basic`);
          }
        }

        // 3. Fall back to Basic NIN lookup if Advance did not populate
        if (!identityData) {
          const basicRes = await provider.verifyNin({ nin: cleanNin });
          if (basicRes.status !== 'success' || !basicRes.data) {
            throw new BadRequestException('NIN verification failed or NIN record not found');
          }
          const b = basicRes.data;
          let photoStr = b.photo || '';
          if (photoStr.includes('base64,')) {
            photoStr = photoStr.split('base64,')[1];
          }

          identityData = {
            nin: cleanNin,
            trackingId: b.tracking_id || b.trackingId || '',
            firstName: b.firstname || b.first_name || '',
            surname: b.surname || b.last_name || '',
            middleName: b.middlename || b.middle_name || '',
            gender: (b.gender || 'MALE').toUpperCase(),
            birthdate: b.birthdate || b.date_of_birth || b.dob || '',
            address: b.residence_address_line_1 || b.residence_address || b.address || '',
            addressLine1: b.residence_lga || b.birth_lga || b.lga || b.residence_town || b.addressLine1 || '',
            state: b.residence_state || b.birth_state || b.state || '',
            lga: b.residence_lga || b.birth_lga || b.lga || '',
            phoneNumber: b.telephoneno || b.phone_number || '',
            photo: photoStr,
            signature: b.signature || '',
          };
          upstreamProviderName = basicRes.meta?.provider || (isSandbox ? 'verixa_mock' : 'direct');
        }

        // Store into Smart Cache
        await this.identityCacheService.setCachedRecord(
          orgId,
          validEnv,
          'nin',
          cleanNin,
          identityData,
          upstreamProviderName,
        );
      } catch (err: any) {
        // Refund if lookup fails
        await this.billingService.refundCredits(orgId, validEnv, cost, reference);
        throw err;
      }
    }

    if (!identityData) {
      throw new BadRequestException('Failed to retrieve verified NIN data');
    }

    const isCard = cardType === 'card' || format === 'card';
    const effectiveCardType: 'card' | 'slip' = isCard ? 'card' : 'slip';

    // 2. Generate requested formats
    let pdfBuffer: Buffer | null = null;
    let docxBuffer: Buffer | null = null;
    let cardPdfBuffer: Buffer | null = null;
    let cardSvg: string | null = null;
    let slipSvg: string | null = null;

    if (format === 'pdf' || format === 'both' || format === 'slip' || !isCard) {
      try {
        pdfBuffer = await this.generatePdf(identityData);
      } catch (e: any) {
        this.logger.warn(`Could not generate PDF Slip: ${e?.message}`);
      }
    }
    if (format === 'docx' || format === 'both' || format === 'slip') {
      try {
        docxBuffer = await this.generateDocx(identityData);
      } catch (e: any) {
        this.logger.warn(`Could not generate DOCX Slip: ${e?.message}`);
      }
    }

    try {
      cardPdfBuffer = await this.generateCardPdf(identityData);
      cardSvg = await this.generateCardSvg(identityData);
    } catch (e: any) {
      this.logger.warn(`Could not generate Digital NIN Card PDF/SVG: ${e?.message}`);
    }

    try {
      slipSvg = await this.generatePaperSvg(identityData);
    } catch (e: any) {
      this.logger.warn(`Could not generate Paper Slip SVG: ${e?.message}`);
    }

    const latencyMs = Math.max(85, Date.now() - startTime);

    // 3. Log into VerificationLog with valid TitleCase Environment enum
    const retentionData = sanitizeIdentityRetention({
      ...identityData,
      nin: cleanNin,
      trackingId: identityData.trackingId,
      firstName: identityData.firstName,
      surname: identityData.surname,
      middleName: identityData.middleName,
      gender: identityData.gender,
      birthdate: identityData.birthdate,
      address: identityData.address || (identityData as any).residence_address || (identityData as any).residence_address_line_1 || '',
      addressLine1: identityData.addressLine1 || (identityData as any).lga || (identityData as any).residence_lga || '',
      state: identityData.state || (identityData as any).residence_state || '',
      photo: identityData.photo || null,
      photoBase64: identityData.photo || null,
    });

    await this.logRepository.save({
      org_id: orgId,
      environment: validEnv,
      api_key_id: apiKeyId || 'dashboard_slip',
      serviceType: 'nin_slip',
      status: VerificationStatus.SUCCESS,
      upstreamProvider: isCacheHit ? 'verixa_smart_cache' : (isSandbox ? 'verixa_mock' : 'direct'),
      isCached: isCacheHit,
      source: isCacheHit ? 'CACHE' : (isSandbox ? 'SANDBOX' : 'LIVE'),
      costDeducted: cost,
      latencyMs,
      cacheKey: this.identityCacheService.generateKey(orgId, validEnv, 'nin', cleanNin),
      requestPayload: { nin: cleanNin, format, cardType: effectiveCardType },
      responsePayload: encryptPayload(retentionData),
    });

    const fullName = [identityData.surname, identityData.firstName, identityData.middleName].filter(Boolean).join(' ');
    const effectivePdfBuffer = isCard ? (cardPdfBuffer || pdfBuffer) : (identityData.nin_id ? Buffer.from(identityData.nin_id, 'base64') : pdfBuffer);
    const effectivePdfBase64 = isCard
      ? (cardPdfBuffer ? cardPdfBuffer.toString('base64') : null)
      : (identityData.nin_id || (pdfBuffer ? pdfBuffer.toString('base64') : null));
    const effectiveSvg = isCard ? cardSvg : (slipSvg || cardSvg);

    const resultData = {
      nin: cleanNin,
      trackingId: identityData.trackingId,
      fullName,
      firstName: identityData.firstName,
      surname: identityData.surname,
      middleName: identityData.middleName,
      gender: identityData.gender,
      birthdate: identityData.birthdate,
      photoBase64: identityData.photo || null,
      slipType: effectiveCardType,
      nin_id: effectivePdfBase64,
      pdfBase64: effectivePdfBase64,
      docxBase64: docxBuffer ? docxBuffer.toString('base64') : null,
      cardPdfBase64: cardPdfBuffer ? cardPdfBuffer.toString('base64') : null,
      cardSvg,
      slipSvg,
      svgContent: effectiveSvg,
      pdfBuffer: effectivePdfBuffer,
      docxBuffer,
      cardPdfBuffer,
    };

    return {
      success: true,
      status: 'success',
      trackingId: identityData.trackingId,
      fullName,
      nin: cleanNin,
      photoBase64: identityData.photo || null,
      slipType: effectiveCardType,
      pdfBase64: effectivePdfBase64,
      docxBase64: docxBuffer ? docxBuffer.toString('base64') : null,
      svgContent: effectiveSvg,
      cardPdfBase64: cardPdfBuffer ? cardPdfBuffer.toString('base64') : null,
      cardSvg,
      slipSvg,
      data: resultData,
      meta: {
        cached: isCacheHit,
        cost_ngx: cost,
        referenceId: reference,
        latency_ms: latencyMs,
      },
    };
  }

  /**
   * On-demand document synthesis from historical verification logs (F17).
   * Reconstructs authentic NIMC card or standard slip from encrypted record retention.
   */
  async generateOnDemandSlip(params: {
    logId: string;
    format: 'card' | 'slip' | string;
    fileType: 'pdf' | 'docx' | string;
    organizationId?: string;
    environment?: string;
  }): Promise<{ buffer: Buffer; contentType: string; filename: string; sizeBytes: number }> {
    const { logId, format, fileType, organizationId } = params;

    if (!logId) {
      throw new BadRequestException('logId is required for on-demand document synthesis');
    }

    const log = await this.logRepository.findOne({ where: { id: logId } });
    if (!log) {
      throw new NotFoundException(`Verification log with ID ${logId} not found`);
    }

    if (!organizationId || log.org_id !== organizationId) {
      throw new NotFoundException(`Verification log with ID ${logId} not found`);
    }

    const isSuccess =
      log.status === VerificationStatus.SUCCESS ||
      String(log.status).toLowerCase() === 'success' ||
      String(log.status).toLowerCase() === 'verified';

    if (!isSuccess) {
      throw new BadRequestException('Document generation is only available for successful verifications');
    }

    const serviceType = String(log.serviceType || (log as any).service_type || '').toLowerCase();
    if (serviceType !== 'nin' && serviceType !== 'nin_slip' && serviceType !== 'nin_advance') {
      throw new BadRequestException(
        `Document synthesis is only supported for NIN records (found: ${log.serviceType || (log as any).service_type || 'unknown'})`
      );
    }

    let identityData: any = decryptPayload(log.responsePayload);

    // Fallback to cache if decrypted payload is missing demographic data (e.g. legacy logs)
    if (!identityData || typeof identityData !== 'object' || (!identityData.nin && !identityData.trackingId && !identityData.firstName)) {
      const cleanNin = String(log.requestPayload?.nin || '').replace(/\D/g, '');
      if (cleanNin) {
        const cached = await this.identityCacheService.getCachedRecord(
          log.org_id,
          log.environment,
          'nin',
          cleanNin,
        );
        if (cached?.data) {
          identityData = cached.data;
        }
      }
    }

    if (!identityData || typeof identityData !== 'object' || (!identityData.nin && !identityData.trackingId && !identityData.firstName)) {
      throw new BadRequestException('Identity demographic data cannot be retrieved from record');
    }

    const normalizedFormat = String(format || 'slip').toLowerCase() as 'card' | 'slip';
    const normalizedFileType = String(fileType || 'pdf').toLowerCase() as 'pdf' | 'docx';

    if (normalizedFormat !== 'card' && normalizedFormat !== 'slip') {
      throw new BadRequestException(`Invalid format "${format}". Supported formats are "card" or "slip".`);
    }
    if (normalizedFileType !== 'pdf' && normalizedFileType !== 'docx') {
      throw new BadRequestException(`Invalid fileType "${fileType}". Supported file types are "pdf" or "docx".`);
    }
    if (normalizedFormat === 'card' && normalizedFileType === 'docx') {
      throw new BadRequestException('DOCX format is not supported for NIMC Card. NIMC Card is available only in PDF format.');
    }

    const cleanNin = String(identityData.nin || log.requestPayload?.nin || '').replace(/\D/g, '');
    const slipData: SlipData = {
      nin: cleanNin,
      trackingId: identityData.trackingId || identityData.nin_id || log.idempotencyKey || log.id.slice(0, 16),
      firstName: identityData.firstName || identityData.first_name || identityData.firstname || '',
      surname: identityData.surname || identityData.last_name || '',
      middleName: identityData.middleName || identityData.middle_name || identityData.middlename || '',
      gender: identityData.gender || 'M',
      birthdate: identityData.birthdate || identityData.dateOfBirth || identityData.dob || '',
      address: identityData.address || identityData.residence_address || identityData.residence_address_line_1 || '',
      addressLine1: identityData.addressLine1 || identityData.lga || identityData.residence_lga || '',
      state: identityData.state || identityData.residence_state || '',
      photo: identityData.photo || identityData.photoBase64 || identityData.image || '',
    };

    let buffer: Buffer;
    let contentType: string;
    let filename: string;
    const fileId = cleanNin || log.id.slice(0, 8);

    if (normalizedFormat === 'card' && normalizedFileType === 'pdf') {
      buffer = await generateNimcCard(slipData);
      contentType = 'application/pdf';
      filename = `NIN_Digital_Card_${fileId}.pdf`;
    } else if (normalizedFormat === 'slip' && normalizedFileType === 'pdf') {
      buffer = await generateStandardNinSlip(slipData);
      contentType = 'application/pdf';
      filename = `NIN_Standard_Slip_${fileId}.pdf`;
    } else if (normalizedFormat === 'slip' && normalizedFileType === 'docx') {
      buffer = await generateDocxSlip(slipData);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      filename = `NIN_Standard_Slip_${fileId}.docx`;
    } else {
      throw new BadRequestException('Unsupported format and fileType combination');
    }

    return {
      buffer,
      contentType,
      filename,
      sizeBytes: buffer.length,
    };
  }
}


