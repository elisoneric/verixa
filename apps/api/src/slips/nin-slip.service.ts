import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DojahProvider } from '../verifications/providers/dojah.provider';
import { IdentityCacheService } from '../verifications/identity-cache.service';
import { BillingService } from '../billing/billing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationLog, VerificationStatus } from '../verifications/entities/verification-log.entity';
import { Environment, normalizeEnvironment } from '../organizations/entities/environment-config.entity';
import { NinAdvanceResult } from '../verifications/providers/verification.provider.interface';
import { generateDocxSlip, generatePdfSlip, getSlipAssetPath, resolveSlipPhotoBuffer } from './slip-generator.util';

@Injectable()
export class NinSlipService {
  private readonly logger = new Logger(NinSlipService.name);

  constructor(
    private dojahProvider: DojahProvider,
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

  async generateSlipForOrganization(
    orgId: string,
    environment: Environment,
    nin: string,
    format: 'pdf' | 'docx' | 'both' = 'pdf',
    apiKeyId?: string,
  ) {
    const cleanNin = String(nin || '').replace(/\D/g, '');
    if (cleanNin.length !== 11) {
      throw new BadRequestException('A valid 11-digit NIN is required');
    }

    const validEnv = normalizeEnvironment(environment);
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
      // CACHE MISS: Live NIN Query
      const rateInfo = await this.billingService.getEffectiveRate(orgId, 'nin_slip' as any, false);
      cost = rateInfo.effectiveRate;
      await this.billingService.deductCredits(orgId, validEnv, cost, reference);

      try {
        let upstreamProviderName = 'direct';

        // 1. Try Live NIN Slip lookup (full NDPC dataset + photo + tracking ID)
        try {
          const slipRes = await this.dojahProvider.verifyNin({ nin: cleanNin, tier: 'slip' });
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
              addressLine1: s.residence_lga ? `${s.residence_lga}, ${s.residence_state || ''}`.trim() : (s.addressLine1 || ''),
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
            upstreamProviderName = slipRes.meta?.provider || 'direct';
          }
        } catch (slipErr: any) {
          this.logger.warn(`verifyNin slip attempt failed: ${slipErr?.message}, falling back to verifyNinAdvance`);
        }

        // 2. Fall back to Advance NIN lookup
        if (!identityData) {
          try {
            const upstreamRes = await this.dojahProvider.verifyNinAdvance({ nin: cleanNin });
            if (upstreamRes.status === 'success' && upstreamRes.data) {
              identityData = upstreamRes.data;
              upstreamProviderName = upstreamRes.meta?.provider || 'direct';
            }
          } catch (advErr: any) {
            this.logger.warn(`verifyNinAdvance attempt failed: ${advErr?.message}, falling back to verifyNin basic`);
          }
        }

        // 3. Fall back to Basic NIN lookup if Advance did not populate
        if (!identityData) {
          const basicRes = await this.dojahProvider.verifyNin({ nin: cleanNin });
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
            addressLine1: b.residence_address_line_1 || b.residence_town || '',
            state: b.residence_state || b.birth_state || b.state || '',
            lga: b.residence_lga || b.birth_lga || b.lga || '',
            phoneNumber: b.telephoneno || b.phone_number || '',
            photo: photoStr,
            signature: b.signature || '',
          };
          upstreamProviderName = basicRes.meta?.provider || 'direct';
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

    // 2. Generate requested formats
    let pdfBuffer: Buffer | null = null;
    let docxBuffer: Buffer | null = null;

    if (format === 'pdf' || format === 'both') {
      pdfBuffer = await this.generatePdf(identityData);
    }
    if (format === 'docx' || format === 'both') {
      docxBuffer = await this.generateDocx(identityData);
    }

    const latencyMs = Math.max(85, Date.now() - startTime);

    // 3. Log into VerificationLog with valid TitleCase Environment enum
    await this.logRepository.save({
      org_id: orgId,
      environment: validEnv,
      api_key_id: apiKeyId || 'dashboard_slip',
      serviceType: 'nin_slip',
      status: VerificationStatus.SUCCESS,
      upstreamProvider: isCacheHit ? 'verixa_smart_cache' : 'direct',
      isCached: isCacheHit,
      source: isCacheHit ? 'CACHE' : 'LIVE',
      costDeducted: cost,
      latencyMs,
      cacheKey: this.identityCacheService.generateKey(orgId, validEnv, 'nin', cleanNin),
      requestPayload: { nin: cleanNin, format },
      responsePayload: {
        trackingId: identityData.trackingId,
        firstName: identityData.firstName,
        surname: identityData.surname,
        hasPhoto: Boolean(identityData.photo),
      },
    });

    return {
      status: 'success',
      data: {
        nin: cleanNin,
        trackingId: identityData.trackingId,
        fullName: `${identityData.firstName} ${identityData.middleName || ''} ${identityData.surname}`.trim(),
        pdfBase64: pdfBuffer ? pdfBuffer.toString('base64') : null,
        docxBase64: docxBuffer ? docxBuffer.toString('base64') : null,
        pdfBuffer,
        docxBuffer,
      },
      meta: {
        cached: isCacheHit,
        cost_ngx: cost,
        referenceId: reference,
        latency_ms: latencyMs,
      },
    };
  }
}
