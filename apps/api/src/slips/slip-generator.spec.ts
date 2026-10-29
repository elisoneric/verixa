import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';
import AdmZip from 'adm-zip';
import {
  SlipGeneratorUtil,
  generateDocxSlip,
  generatePdfSlip,
  generateDigitalNinCardPdf,
  generateDigitalNinCardSvg,
  generatePaperSlipSvg,
  getSlipAssetPath,
  resolveSlipPhotoBuffer,
  wrapText,
  formatNimcDate,
  generateNimcCard,
  generateStandardNinSlip,
  SlipData,
} from './slip-generator.util';

describe('SlipGeneratorUtil', () => {
  const sampleSlipData: SlipData = {
    nin: '12345678901',
    trackingId: 'TRK-987654321',
    firstName: 'Aminu',
    surname: 'Bello',
    middleName: 'Kano',
    gender: 'MALE',
    birthdate: '1988-06-12',
    address: 'Plot 402 Constitution Avenue Central Business District Area 11',
    addressLine1: 'Abuja Municipal',
    state: 'FCT',
  };

  describe('Asset Resolution & Path Lookup', () => {
    it('should locate existing slip assets on disk', () => {
      const templatePath = getSlipAssetPath('nin_card_template.png');
      const docxPath = getSlipAssetPath('ninslip.docx');
      const bgPath = getSlipAssetPath('image1.jpg');
      const defaultPhotoPath = getSlipAssetPath('default_mock_photo.jpg');

      expect(fs.existsSync(templatePath)).toBe(true);
      expect(fs.existsSync(docxPath)).toBe(true);
      expect(fs.existsSync(bgPath)).toBe(true);
      expect(fs.existsSync(defaultPhotoPath)).toBe(true);
    });

    it('should return default fallback candidate path when file does not exist', () => {
      const nonExistent = getSlipAssetPath('non_existent_asset_file.xyz');
      expect(nonExistent).toContain('non_existent_asset_file.xyz');
    });
  });

  describe('resolveSlipPhotoBuffer', () => {
    it('should fallback to default_mock_photo.jpg when photo is undefined or null', () => {
      const photoBuf = resolveSlipPhotoBuffer(undefined);
      expect(photoBuf).toBeInstanceOf(Buffer);
      expect(photoBuf!.length).toBeGreaterThan(1000);
    });

    it('should return buffer directly if Buffer is passed', () => {
      const rawBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const result = resolveSlipPhotoBuffer(rawBuf);
      expect(result).toBe(rawBuf);
    });

    it('should strip data:image/jpeg;base64, prefix and return decoded buffer', () => {
      const originalText = 'mock-photo-content';
      const b64 = Buffer.from(originalText).toString('base64');
      const dataUrl = `data:image/jpeg;base64,${b64}`;

      const resolved = resolveSlipPhotoBuffer(dataUrl);
      expect(resolved).toBeInstanceOf(Buffer);
      expect(resolved!.toString('utf8')).toBe(originalText);
    });

    it('should fallback to default photo when given an empty string', () => {
      const resolved = resolveSlipPhotoBuffer('');
      expect(resolved).toBeInstanceOf(Buffer);
      expect(resolved!.length).toBeGreaterThan(1000);
    });
  });

  describe('wrapText', () => {
    it('should return empty array for empty or undefined text', () => {
      expect(wrapText(undefined)).toEqual([]);
      expect(wrapText('')).toEqual([]);
    });

    it('should not wrap short text that fits within maxCharsPerLine', () => {
      const lines = wrapText('Short text', 28);
      expect(lines).toEqual(['Short text']);
    });

    it('should wrap long address cleanly without splitting words mid-word', () => {
      const text = 'Plot 402 Constitution Avenue Central Business District Area 11';
      const lines = wrapText(text, 28);
      expect(lines.length).toBeGreaterThan(1);
      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(35); // word boundaries respected
      });
      expect(lines.join(' ')).toBe(text);
    });
  });

  describe('formatNimcDate', () => {
    it('should format ISO date to NIMC standard DD  MON  YYYY', () => {
      expect(formatNimcDate('1988-06-12')).toBe('12  JUN  1988');
      expect(formatNimcDate('2001-01-05')).toBe('05  JAN  2001');
    });

    it('should return uppercase string if date parsing yields fallback', () => {
      expect(formatNimcDate('custom-date-format')).toBe('CUSTOM-DATE-FORMAT');
    });

    it('should return empty string for undefined input', () => {
      expect(formatNimcDate(undefined)).toBe('');
    });
  });

  describe('generateDigitalNinCardPdf', () => {
    it('should generate a valid PDF buffer matching ID-1 card dimensions (242.65 x 153.01 pt)', async () => {
      const pdfBuffer = await generateDigitalNinCardPdf(sampleSlipData);

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');

      const pdfDoc = await PDFDocument.load(pdfBuffer);
      expect(pdfDoc.getPageCount()).toBe(1);

      const page = pdfDoc.getPage(0);
      const { width, height } = page.getSize();
      expect(Math.abs(width - 242.65)).toBeLessThan(0.5);
      expect(Math.abs(height - 153.01)).toBeLessThan(0.5);
    });

    it('should handle female gender mapping ("FEMALE" -> "F")', async () => {
      const femaleData: SlipData = {
        ...sampleSlipData,
        gender: 'FEMALE',
      };
      const pdfBuffer = await generateDigitalNinCardPdf(femaleData);
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(5000);
    });

    it('should generate valid card PDF even when photo is omitted (using default mock photo fallback)', async () => {
      const noPhotoData: SlipData = {
        ...sampleSlipData,
        photo: undefined,
      };
      const pdfBuffer = await generateDigitalNinCardPdf(noPhotoData);
      expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    });

    it('should alias generateNimcCard to generateDigitalNinCardPdf', () => {
      expect(generateNimcCard).toBe(SlipGeneratorUtil.generateDigitalNinCardPdf);
    });
  });

  describe('generatePdfSlip', () => {
    it('should generate a valid PDF buffer matching A4 dimensions (595.28 x 841.89 pt)', async () => {
      const pdfBuffer = await generatePdfSlip(sampleSlipData);

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');

      const pdfDoc = await PDFDocument.load(pdfBuffer);
      expect(pdfDoc.getPageCount()).toBe(1);

      const page = pdfDoc.getPage(0);
      const { width, height } = page.getSize();
      expect(Math.abs(width - 595.28)).toBeLessThan(0.5);
      expect(Math.abs(height - 841.89)).toBeLessThan(0.5);
    });

    it('should alias generateStandardNinSlip to generatePdfSlip', () => {
      expect(generateStandardNinSlip).toBe(SlipGeneratorUtil.generatePdfSlip);
    });
  });

  describe('generateDocxSlip', () => {
    it('should generate a valid DOCX ZIP archive containing updated document.xml and photo', async () => {
      const docxBuffer = await generateDocxSlip(sampleSlipData);

      expect(Buffer.isBuffer(docxBuffer)).toBe(true);
      // Valid ZIP archive starts with PK\x03\x04
      expect(docxBuffer[0]).toBe(0x50);
      expect(docxBuffer[1]).toBe(0x4b);
      expect(docxBuffer[2]).toBe(0x03);
      expect(docxBuffer[3]).toBe(0x04);

      const zip = new AdmZip(docxBuffer);
      const docXml = zip.readAsText('word/document.xml');

      // Tokens must be replaced
      expect(docXml).toContain('12345678901');
      expect(docXml).toContain('AMINU');
      expect(docXml).toContain('BELLO');
      expect(docXml).toContain('KANO');
      expect(docXml).toContain('TRK987654321');
      expect(docXml).toContain('FCT');

      // Font size tag normalized to 15
      expect(docXml).toContain('<w:sz w:val="15"/><w:szCs w:val="15"/>');
      // ProofErr tags stripped
      expect(docXml).not.toContain('<w:proofErr');

      // Photo media updated
      const image2 = zip.getEntry('word/media/image2.png');
      expect(image2).toBeDefined();
    });
  });

  describe('SVG Slip and Card Generation', () => {
    it('should generate valid Digital NIN Card SVG string', async () => {
      const svg = await generateDigitalNinCardSvg(sampleSlipData);
      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 800 507"');
      expect(svg).toContain('id="guillochePattern"');
      expect(svg).toContain('id="smartChip"');
      expect(svg).toContain('1234   567   8901');
      expect(svg).toContain('BELLO');
    });

    it('should generate valid Paper Slip SVG string', async () => {
      const svg = await generatePaperSlipSvg(sampleSlipData);
      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 1539 733"');
      expect(svg).toContain('12345678901');
      expect(svg).toContain('BELLO');
    });
  });
});
