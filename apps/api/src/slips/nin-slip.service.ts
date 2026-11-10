import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
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
  generateNimcPremiumDocx,
  generatePdfSlip,
  generateDigitalNinCardPdf,
  generateDigitalNinCardSvg,
  generatePaperSlipSvg,
  generateNimcPremiumCard,
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

  async generatePremiumCard(data: NinAdvanceResult | any) {
    try {
      return await generateNimcPremiumCard(data);
    } catch (err: any) {
      throw new InternalServerErrorException(`NIMC Premium Card generation error: ${err?.message}`);
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

        // 1. Fast Basic NIN lookup first (<800ms response time)
        try {
          const basicRes = await provider.verifyNin({ nin: cleanNin });
          if (basicRes.status === 'success' && basicRes.data) {
            const b = basicRes.data;
            let photoStr = b.photo || '';
            if (photoStr.includes('base64,')) {
              photoStr = photoStr.split('base64,')[1];
            }
            identityData = {
              nin: cleanNin,
              trackingId: (b.tracking_id || b.trackingId || '').trim(),
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
              nin_id: b.nin_id,
            };
            upstreamProviderName = basicRes.meta?.provider || (isSandbox ? 'verixa_mock' : 'direct');
          }
        } catch {}

        // 2. Fall back to Advance NIN lookup if Basic did not populate
        if (!identityData) {
          try {
            const advRes = await provider.verifyNinAdvance({ nin: cleanNin });
            if (advRes.status === 'success' && advRes.data) {
              identityData = advRes.data;
              upstreamProviderName = advRes.meta?.provider || (isSandbox ? 'verixa_mock' : 'direct');
            }
          } catch {}
        }

        // 3. Fall back to NIN Slip lookup only as last resort
        if (!identityData) {
          const slipRes = await provider.verifyNin({ nin: cleanNin, tier: 'slip' });
          if (slipRes.status !== 'success' || !slipRes.data) {
            throw new BadRequestException('NIN verification failed or record not found');
          }
          const s = slipRes.data;
          let photoStr = s.photo || '';
          if (photoStr.includes('base64,')) {
            photoStr = photoStr.split('base64,')[1];
          }
          identityData = {
            nin: cleanNin,
            trackingId: (s.tracking_id || s.trackingId || '').trim(),
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
    format: 'pdf' | 'docx' | 'both' | 'card' | 'slip' | 'premium' | string = 'pdf',
    apiKeyId?: string,
    cardType: 'slip' | 'card' | 'premium' = 'slip',
  ) {

    const cleanNin = String(nin || '').replace(/\D/g, '');
    if (cleanNin.length !== 11) {
      throw new BadRequestException('A valid 11-digit NIN is required');
    }

    const validEnv = normalizeEnvironment(environment);
    const isSandbox = validEnv === Environment.SANDBOX || cleanNin === '70123456789' || cleanNin === '11234567890';
    const provider = isSandbox ? this.mockProvider : this.dojahProvider;
    const startTime = Date.now();

    const isPremium = cardType === 'premium' || format === 'premium';
    const isDojahSlipSelected = (cardType === 'card' || format === 'card') && !isPremium;
    const effectiveCardType: 'slip' | 'card' | 'premium' = isPremium ? 'premium' : (isDojahSlipSelected ? 'card' : 'slip');

    const isApiCall = Boolean(apiKeyId && apiKeyId !== 'dashboard_ui' && apiKeyId !== 'dashboard_slip' && apiKeyId !== 'dashboard_download');

    let serviceTypeRateKey: 'nin_slip' | 'nin_card' | 'nin_premium' | 'nin_premium_ui' = 'nin_slip';
    let defaultSlipPrice = 250;
    if (effectiveCardType === 'card') {
      serviceTypeRateKey = 'nin_card';
      defaultSlipPrice = 300;
    } else if (effectiveCardType === 'premium') {
      serviceTypeRateKey = isApiCall ? 'nin_premium' : 'nin_premium_ui';
      defaultSlipPrice = isApiCall ? 120 : 350;
    }

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

    // For standard slip, cache is only valid if complete address is present
    // For NIMC Card, cache is valid if demographic data & photo is present
    const hasAddress = Boolean(cached?.data?.address || cached?.data?.residence_address || cached?.data?.residence_address_line_1 || cached?.data?.lga);
    const hasCardDemographics = Boolean(cached?.data?.firstName || cached?.data?.surname);
    const isCacheUsable = Boolean(
      cached &&
      cached.data?.photo &&
      (effectiveCardType === 'premium' || (effectiveCardType === 'slip' ? hasAddress : hasCardDemographics))
    );

    if (isCacheUsable) {
      // CACHE HIT! Discounted rate for regenerating existing verified slip
      isCacheHit = true;
      const rateInfo = await this.billingService.getEffectiveRate(orgId, serviceTypeRateKey, true);
      cost = rateInfo.effectiveRate || 50;
      await this.billingService.deductCredits(orgId, validEnv, cost, reference);
      identityData = cached!.data;
    } else {
      // CACHE MISS: Live or Sandbox NIN Query
      const rateInfo = await this.billingService.getEffectiveRate(orgId, serviceTypeRateKey, false);
      cost = rateInfo.effectiveRate || defaultSlipPrice;
      await this.billingService.deductCredits(orgId, validEnv, cost, reference);

      try {
        let upstreamProviderName = isSandbox ? 'verixa_mock' : 'direct';

        if (effectiveCardType === 'premium') {
          // 1. Premium calls Dojah Basic (tier: 'basic', upstream cost ₦60)
          try {
            const basicRes = await provider.verifyNin({ nin: cleanNin, tier: 'basic' });
            if (basicRes.status === 'success' && basicRes.data) {
              const b = basicRes.data;
              let photoStr = b.photo || '';
              if (photoStr.includes('base64,')) {
                photoStr = photoStr.split('base64,')[1];
              }
              identityData = {
                nin: cleanNin,
                trackingId: (b.tracking_id || b.trackingId || '').trim(),
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
                nin_id: b.nin_id,
              };
              upstreamProviderName = basicRes.meta?.provider || (isSandbox ? 'verixa_mock' : 'direct');
            }
          } catch (fastErr: any) {
            this.logger.warn(`Basic NIN query failed for premium: ${fastErr?.message}`);
          }
        } else if (effectiveCardType === 'card') {
          // 2. NIMC Card calls Dojah NIN Slip (tier: 'slip', upstream cost ₦80)
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
                trackingId: (s.tracking_id || s.trackingId || '').trim(),
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
                nin_id: s.nin_id || s.image || (s as any).card_image,
                image: s.image || s.nin_id || (s as any).card_image,
              };
              upstreamProviderName = slipRes.meta?.provider || (isSandbox ? 'verixa_mock' : 'direct');
            }
          } catch (slipErr: any) {
            this.logger.warn(`verifyNin slip attempt failed: ${slipErr?.message}`);
          }
        } else {
          // 3. Standard NIN Slip calls Dojah NIN Advance (upstream cost ₦85) so it gets full address
          try {
            const upstreamRes = await provider.verifyNinAdvance({ nin: cleanNin });
            if (upstreamRes.status === 'success' && upstreamRes.data) {
              const a = upstreamRes.data;
              identityData = {
                ...a,
                nin: cleanNin,
                trackingId: (a.tracking_id || a.trackingId || '').trim(),
              };
              upstreamProviderName = upstreamRes.meta?.provider || (isSandbox ? 'verixa_mock' : 'direct');
            }
          } catch (advErr: any) {
            this.logger.warn(`verifyNinAdvance attempt failed: ${advErr?.message}`);
          }
        }

        // Fallback to basic NIN lookup if initial query did not populate
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
            trackingId: (b.tracking_id || b.trackingId || '').trim(),
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
            nin_id: b.nin_id,
            image: b.image || b.nin_id,
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

    // 2. Generate requested format:
    // - "premium": Custom NIMC Card Premium (Plastic Card + Printable A4 PDF)
    // - "card": Authentic Dojah official NIMC card (entity.nin_id)
    // - "slip": Standard government slip compiled from Word DOCX to PDF
    let pdfBuffer: Buffer | null = null;
    let docxBuffer: Buffer | null = null;
    let slipSvg: string | null = null;
    let cardImageBase64: string | null = null;

    if (isPremium) {
      try {
        const premiumRes = await generateNimcPremiumCard({
          nin: cleanNin,
          trackingId: identityData.trackingId || '',
          firstName: identityData.firstName,
          surname: identityData.surname,
          middleName: identityData.middleName,
          gender: identityData.gender,
          birthdate: identityData.birthdate,
          photo: identityData.photo,
        });
        pdfBuffer = premiumRes.pdfBuffer;
        slipSvg = premiumRes.cardSvg;
        cardImageBase64 = premiumRes.cardImageBase64;
        if (premiumRes.docxBuffer) {
          docxBuffer = premiumRes.docxBuffer;
        }
      } catch (e: any) {
        this.logger.warn(`Could not generate NIMC Premium Card: ${e?.message}`);
      }
    } else if (isDojahSlipSelected) {
      // NIMC Card: Generate crisp Digital NIN Card using verified Dojah demographic data
      // Never pass through Dojah's raw nin_id PDF because Dojah upstream lacks embedded fonts causing tofu rectangles (□□□□)!
      try {
        pdfBuffer = await generateDigitalNinCardPdf(identityData);
        slipSvg = await generateDigitalNinCardSvg(identityData);
        try {
          const cardPngBuf = await sharp(Buffer.from(slipSvg, 'utf-8')).png().toBuffer();
          cardImageBase64 = `data:image/png;base64,${cardPngBuf.toString('base64')}`;
        } catch {
          cardImageBase64 = `data:image/svg+xml;base64,${Buffer.from(slipSvg, 'utf-8').toString('base64')}`;
        }
      } catch (cardErr: any) {
        this.logger.warn(`Could not generate Digital NIN Card: ${cardErr?.message}`);
        pdfBuffer = await this.generatePdf(identityData);
      }
    } else {
      try {
        pdfBuffer = await this.generatePdf(identityData);
      } catch (e: any) {
        this.logger.warn(`Could not generate DOCX-to-PDF Slip: ${e?.message}`);
      }
      try {
        docxBuffer = await this.generateDocx(identityData);
      } catch (e: any) {
        this.logger.warn(`Could not generate DOCX Slip: ${e?.message}`);
      }
      try {
        slipSvg = await this.generatePaperSvg(identityData);
      } catch {}
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
      nin_id: identityData.nin_id || null,
    });

    await this.logRepository.save({
      org_id: orgId,
      environment: validEnv,
      api_key_id: apiKeyId || 'dashboard_slip',
      serviceType: serviceTypeRateKey,
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
    const effectivePdfBase64 = pdfBuffer
      ? pdfBuffer.toString('base64')
      : (identityData.nin_id || null);
    const effectivePdfBuffer = pdfBuffer || (effectivePdfBase64 ? Buffer.from(effectivePdfBase64, 'base64') : null);

    const resultData: any = {
      // 1. Identity Identifiers
      nin: cleanNin,
      tracking_id: identityData.trackingId,
      trackingId: identityData.trackingId,

      // 2. Names
      first_name: identityData.firstName,
      firstName: identityData.firstName,
      last_name: identityData.surname,
      surname: identityData.surname,
      middle_name: identityData.middleName,
      middleName: identityData.middleName,
      full_name: fullName,
      fullName: fullName,

      // 3. Demographics
      date_of_birth: identityData.birthdate,
      birthdate: identityData.birthdate,
      gender: identityData.gender,
      phone_number: identityData.phoneNumber,
      phoneNumber: identityData.phoneNumber,
      employment_status: identityData.employment_status,
      marital_status: identityData.marital_status,
      height: identityData.height,

      // 4. Address & Geography
      residence_address_line_1: identityData.address,
      address: identityData.address,
      residence_lga: identityData.lga,
      lga: identityData.lga,
      residence_state: identityData.state,
      state: identityData.state,
      birth_state: identityData.birth_state || identityData.state,

      // 5. Biometrics
      photo: identityData.photo || null,
      photoBase64: identityData.photo || null,
      signature: identityData.signature || null,

      // 6. Slip Document Output
      slipType: effectiveCardType,
      nin_id: effectivePdfBase64,
      pdfBase64: effectivePdfBase64,
      card_image: cardImageBase64,
      image: cardImageBase64,
      cardPdfBase64: (isPremium || isDojahSlipSelected) ? effectivePdfBase64 : undefined,
      docxBase64: docxBuffer ? docxBuffer.toString('base64') : null,
      svgContent: slipSvg,
      slipSvg,
    };

    // Attach binary buffers as non-enumerable properties so they are accessible in Node.js
    // but NEVER serialized into multi-megabyte JSON arrays in HTTP responses!
    Object.defineProperty(resultData, 'pdfBuffer', { value: effectivePdfBuffer, enumerable: false, writable: true });
    Object.defineProperty(resultData, 'docxBuffer', { value: docxBuffer, enumerable: false, writable: true });

    return {
      success: true,
      status: 'success',
      nin: cleanNin,
      trackingId: identityData.trackingId,
      tracking_id: identityData.trackingId,
      fullName,
      full_name: fullName,
      firstName: identityData.firstName,
      first_name: identityData.firstName,
      surname: identityData.surname,
      last_name: identityData.surname,
      middleName: identityData.middleName,
      middle_name: identityData.middleName,
      date_of_birth: identityData.birthdate,
      gender: identityData.gender,
      phone_number: identityData.phoneNumber,
      residence_address_line_1: identityData.address,
      residence_lga: identityData.lga,
      residence_state: identityData.state,
      birth_state: identityData.birth_state || identityData.state,
      employment_status: identityData.employment_status,
      marital_status: identityData.marital_status,
      height: identityData.height,
      photoBase64: identityData.photo || null,
      photo: identityData.photo || null,
      slipType: effectiveCardType,
      nin_id: effectivePdfBase64,
      pdfBase64: effectivePdfBase64,
      card_image: cardImageBase64,
      image: cardImageBase64,
      cardPdfBase64: (isPremium || isDojahSlipSelected) ? effectivePdfBase64 : undefined,
      svgContent: slipSvg,
      data: resultData,
      entity: resultData,
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

    const reqCardType = (log.requestPayload as any)?.cardType || (log.requestPayload as any)?.type;
    const reqFormat = (log.requestPayload as any)?.format;
    const cost = Number(log.costDeducted || 0);
    const sType = String(log.serviceType || '').toLowerCase();
    let originalFormat: 'card' | 'slip' | 'premium' = 'slip';
    if (
      reqCardType === 'premium' ||
      reqFormat === 'premium' ||
      sType === 'nin_premium' ||
      cost === 350
    ) {
      originalFormat = 'premium';
    } else if (
      reqCardType === 'card' ||
      reqFormat === 'card' ||
      sType === 'nin_card' ||
      cost === 300
    ) {
      originalFormat = 'card';
    }

    const normalizedFormat = String(format || originalFormat).toLowerCase() as 'card' | 'slip' | 'premium';
    const normalizedFileType = String(fileType || 'pdf').toLowerCase() as 'pdf' | 'docx';

    if (normalizedFormat !== 'card' && normalizedFormat !== 'slip' && normalizedFormat !== 'premium') {
      throw new BadRequestException(`Invalid format "${format}". Supported formats are "card", "slip", or "premium".`);
    }
    if (normalizedFileType !== 'pdf' && normalizedFileType !== 'docx') {
      throw new BadRequestException(`Invalid fileType "${fileType}". Supported file types are "pdf" or "docx".`);
    }
    if (normalizedFormat === 'card' && normalizedFileType === 'docx') {
      throw new BadRequestException('DOCX format is not supported for NIMC Card. Available only in PDF format.');
    }

    const cleanNin = String(identityData.nin || log.requestPayload?.nin || '').replace(/\D/g, '');
    const slipData: SlipData = {
      nin: cleanNin,
      trackingId: (identityData.trackingId || identityData.tracking_id || '').trim(),
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

    if (normalizedFormat === 'premium' && normalizedFileType === 'pdf') {
      const premRes = await generateNimcPremiumCard(slipData);
      buffer = premRes.pdfBuffer;
      contentType = 'application/pdf';
      filename = `NIMC_Premium_Card_${fileId}.pdf`;
    } else if (normalizedFormat === 'premium' && normalizedFileType === 'docx') {
      buffer = await generateNimcPremiumDocx(slipData);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      filename = `NIMC_Premium_Card_${fileId}.docx`;
    } else if (normalizedFormat === 'card' && normalizedFileType === 'pdf') {
      try {
        buffer = await generateDigitalNinCardPdf(slipData);
      } catch {
        buffer = await generateStandardNinSlip(slipData);
      }
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


