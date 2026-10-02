import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import { DojahProvider } from '../verifications/providers/dojah.provider';
import { IdentityCacheService } from '../verifications/identity-cache.service';
import { BillingService } from '../billing/billing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationLog, VerificationStatus } from '../verifications/entities/verification-log.entity';
import { Environment } from '../organizations/entities/environment-config.entity';
import { NinAdvanceResult } from '../verifications/providers/verification.provider.interface';

@Injectable()
export class NinSlipService {
  private readonly logger = new Logger(NinSlipService.name);
  private readonly assetsDir = path.resolve(__dirname, 'assets');

  constructor(
    private dojahProvider: DojahProvider,
    private identityCacheService: IdentityCacheService,
    private billingService: BillingService,
    @InjectRepository(VerificationLog)
    private logRepository: Repository<VerificationLog>,
  ) {}

  private getAssetPath(filename: string): string {
    const primary = path.join(this.assetsDir, filename);
    if (fs.existsSync(primary)) return primary;
    // Fallback if running from dist
    const rootFallback = path.resolve(process.cwd(), 'apps/api/src/slips/assets', filename);
    if (fs.existsSync(rootFallback)) return rootFallback;
    const directFallback = path.resolve(process.cwd(), filename);
    if (fs.existsSync(directFallback)) return directFallback;
    return primary;
  }

  async generateDocx(data: NinAdvanceResult): Promise<Buffer> {
    const templatePath = this.getAssetPath('ninslip.docx');
    if (!fs.existsSync(templatePath)) {
      throw new InternalServerErrorException(`DOCX template not found at ${templatePath}`);
    }

    const zip = new AdmZip(templatePath);
    let docXml = zip.readAsText('word/document.xml');

    // No space in NIN as requested
    const cleanNin = String(data.nin || '').replace(/\D/g, '');
    // Tracking ID: if present, strip all spaces and dashes; else leave empty
    const cleanTrackingId = data.trackingId ? String(data.trackingId).replace(/[\s-]/g, '') : '';
    // Gender: M or F
    const genderChar = (data.gender || '').toUpperCase().startsWith('F') ? 'F' : 'M';

    const replacements: Record<string, string> = {
      '\\[trackid\\]': cleanTrackingId,
      '\\[nin\\]': cleanNin,
      '\\[surname\\]': (data.surname || '').toUpperCase(),
      '\\[firstname\\]': (data.firstName || '').toUpperCase(),
      '\\[middle\\]': (data.middleName || '').toUpperCase(),
      '\\[gender\\]': genderChar,
      '\\[address\\]': (data.address || '').toUpperCase(),
      '\\[address1\\]': (data.addressLine1 || '').toUpperCase(),
      '\\[state\\]': (data.state || '').toUpperCase(),
    };

    for (const [key, val] of Object.entries(replacements)) {
      docXml = docXml.replace(new RegExp(key, 'g'), val);
    }

    // Replace runs broken across Word xml elements
    docXml = docXml.replace(/\[\s*<\/w:t>.*?<w:t>trackid<\/w:t>.*?<w:t>\s*\]/gs, cleanTrackingId);
    docXml = docXml.replace(/\[\s*<\/w:t>.*?<w:t>nin<\/w:t>.*?<w:t>\s*\]/gs, cleanNin);
    docXml = docXml.replace(/\[\s*<\/w:t>.*?<w:t>firstname<\/w:t>.*?<w:t>\s*\]/gs, (data.firstName || '').toUpperCase());

    // Ensure all font size is 15 (7.5 pt) and regular (remove bold tags if any in runs)
    docXml = docXml.replace(/<w:sz w:val="\d+"\/>/g, '<w:sz w:val="15"/><w:szCs w:val="15"/>');

    zip.updateFile('word/document.xml', Buffer.from(docXml, 'utf-8'));

    // Inject photo
    const photoBuffer = this.resolvePhotoBuffer(data.photo);
    if (photoBuffer) {
      zip.updateFile('word/media/image2.png', photoBuffer);
      zip.updateFile('word/media/image10.png', photoBuffer);
    }

    return zip.toBuffer();
  }

  async generatePdf(data: NinAdvanceResult): Promise<Buffer> {
    const bgPath = this.getAssetPath('image1.jpg');
    if (!fs.existsSync(bgPath)) {
      throw new InternalServerErrorException(`Background image not found at ${bgPath}`);
    }

    const bgBuffer = fs.readFileSync(bgPath);
    const photoBuffer = this.resolvePhotoBuffer(data.photo);

    const pdfDoc = await PDFDocument.create();
    // A4 portrait: 595.28 x 841.89 points
    const page = pdfDoc.addPage([595.28, 841.89]);
    
    // Regular weight font (NO BOLD) at 7.5 pt size (Yoxall 7.5 ms word equivalent)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const bgImage = await pdfDoc.embedJpg(bgBuffer);

    let photoImage: any = null;
    if (photoBuffer) {
      try {
        if (photoBuffer[0] === 0x89 && photoBuffer[1] === 0x50) {
          photoImage = await pdfDoc.embedPng(photoBuffer);
        } else {
          photoImage = await pdfDoc.embedJpg(photoBuffer);
        }
      } catch (err) {
        this.logger.warn(`Failed to embed photo directly, falling back to default photo: ${err}`);
      }
    }

    if (!photoImage) {
      const defaultPhotoPath = this.getAssetPath('default_mock_photo.jpg');
      if (fs.existsSync(defaultPhotoPath)) {
        photoImage = await pdfDoc.embedJpg(fs.readFileSync(defaultPhotoPath));
      }
    }

    // EMU to points: 1 pt = 12700 EMU
    const emuToPt = (emu: number) => emu / 12700.0;

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    const bgWidth = emuToPt(7037959); // ~554.17 pt
    const bgHeight = emuToPt(3352800); // ~264 pt
    const bgX = (pageWidth - bgWidth) / 2.0;

    const photoWidth = emuToPt(1057021); // ~83.2 pt
    const photoHeight = emuToPt(1369369); // ~107.8 pt
    const photoRelX = emuToPt(5953125);
    const photoRelYFromTop = emuToPt(781050) + photoHeight;

    // No space in NIN number
    const cleanNin = String(data.nin || '').replace(/\D/g, '');
    // Tracking ID: if present, strip spaces and dashes; else leave empty
    const cleanTrackingId = data.trackingId ? String(data.trackingId).replace(/[\s-]/g, '') : '';
    // Gender: M or F
    const genderChar = (data.gender || '').toUpperCase().startsWith('F') ? 'F' : 'M';

    const renderSlip = (topOffset: number) => {
      const slipY = topOffset - bgHeight;
      page.drawImage(bgImage, {
        x: bgX,
        y: slipY,
        width: bgWidth,
        height: bgHeight,
      });

      if (photoImage) {
        page.drawImage(photoImage, {
          x: bgX + photoRelX,
          y: topOffset - photoRelYFromTop,
          width: photoWidth,
          height: photoHeight,
        });
      }

      // 7.5 pt font, regular weight (no bold)
      const drawField = (text: string, emuX: number, emuY: number, size = 7.5, color = rgb(0, 0, 0)) => {
        if (!text) return;
        const x = bgX + emuToPt(emuX);
        const y = topOffset - emuToPt(emuY) - size;
        page.drawText(String(text).toUpperCase(), {
          x,
          y,
          size,
          font: fontRegular,
          color,
        });
      };

      // Draw tracking ID only if present (no space, no dash); else blank
      if (cleanTrackingId) {
        drawField(cleanTrackingId, 792785, 928624, 7.5);
      }
      drawField(cleanNin, 792785, 1317695, 7.5);
      drawField(data.surname, 2592865, 956509, 7.5);
      drawField(data.firstName, 2592677, 1314486, 7.5);
      drawField(data.middleName, 2598833, 1670684, 7.5);
      drawField(genderChar, 2592865, 1972564, 7.5); // Single char: M or F
      drawField(data.address, 4104725, 1081024, 7.5);
      drawField(data.addressLine1, 4104873, 1881124, 7.5);
      drawField(data.state, 4104873, 2025904, 7.5);

      return slipY;
    };

    // 1. Top slip
    const topSlipY = renderSlip(pageHeight - 25);

    // 2. Tear line in the middle
    const tearY = topSlipY - 25;
    page.drawLine({
      start: { x: bgX, y: tearY },
      end: { x: bgX + bgWidth, y: tearY },
      thickness: 0.75,
      color: rgb(0.65, 0.65, 0.65),
      dashArray: [4, 4],
    });

    page.drawText('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  TEAR / CUT HERE  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -', {
      x: bgX + 20,
      y: tearY + 4,
      size: 7,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    // 3. Bottom slip (Applicant duplicate)
    renderSlip(tearY - 25);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private resolvePhotoBuffer(photo: string | undefined): Buffer | null {
    if (!photo) {
      const defaultPhotoPath = this.getAssetPath('default_mock_photo.jpg');
      return fs.existsSync(defaultPhotoPath) ? fs.readFileSync(defaultPhotoPath) : null;
    }

    try {
      const cleanBase64 = photo.includes('base64,') ? photo.split('base64,')[1] : photo;
      return Buffer.from(cleanBase64, 'base64');
    } catch {
      return null;
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

    const startTime = Date.now();

    // 1. Check Smart Identity Cache for existing NIN Advance record
    const cached = await this.identityCacheService.getCachedRecord(
      orgId,
      environment,
      'nin',
      cleanNin,
    );

    let identityData: NinAdvanceResult;
    let isCacheHit = false;
    let cost = 0;
    const reference = `vx_slip_${uuidv4().slice(0, 12)}`;

    if (cached && cached.data?.photo && cached.data?.trackingId) {
      // CACHE HIT! Discounted rate for regenerating existing verified slip
      isCacheHit = true;
      const rateInfo = await this.billingService.getEffectiveRate(orgId, 'nin_slip' as any, true);
      cost = rateInfo.effectiveRate;
      await this.billingService.deductCredits(orgId, environment, cost, reference);
      identityData = cached.data;
    } else {
      // CACHE MISS: Live NIN Advance Query (Standard rate ₦270)
      const rateInfo = await this.billingService.getEffectiveRate(orgId, 'nin_slip' as any, false);
      cost = rateInfo.effectiveRate;
      await this.billingService.deductCredits(orgId, environment, cost, reference);

      try {
        const upstreamRes = await this.dojahProvider.verifyNinAdvance({ nin: cleanNin });
        if (upstreamRes.status !== 'success' || !upstreamRes.data) {
          throw new BadRequestException('NIN Advance verification failed or NIN not found');
        }

        identityData = upstreamRes.data;

        // Store into Smart Cache
        await this.identityCacheService.setCachedRecord(
          orgId,
          environment,
          'nin',
          cleanNin,
          identityData,
          upstreamRes.meta?.provider || 'dojah',
        );
      } catch (err: any) {
        // Refund if lookup fails
        await this.billingService.refundCredits(orgId, environment, cost, reference);
        throw err;
      }
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

    // 3. Log into VerificationLog
    await this.logRepository.save({
      org_id: orgId,
      environment,
      api_key_id: apiKeyId || 'dashboard_slip',
      serviceType: 'nin_slip',
      status: VerificationStatus.SUCCESS,
      upstreamProvider: isCacheHit ? 'verixa_smart_cache' : 'dojah',
      isCached: isCacheHit,
      source: isCacheHit ? 'CACHE' : 'LIVE',
      costDeducted: cost,
      latencyMs,
      cacheKey: this.identityCacheService.generateKey(orgId, environment, 'nin', cleanNin),
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
