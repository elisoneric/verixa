import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface SlipData {
  nin: string;
  trackingId?: string;
  firstName?: string;
  surname?: string;
  middleName?: string;
  gender?: string;
  address?: string;
  addressLine1?: string;
  state?: string;
  photo?: string | Buffer;
}

export function getSlipAssetPath(filename: string): string {
  const candidates = [
    path.resolve(__dirname, 'assets', filename),
    path.resolve(process.cwd(), 'apps/api/src/slips/assets', filename),
    path.resolve(process.cwd(), 'src/slips/assets', filename),
    path.resolve(process.cwd(), filename),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

export function resolveSlipPhotoBuffer(photo?: string | Buffer): Buffer | null {
  if (!photo) {
    const defaultPhotoPath = getSlipAssetPath('default_mock_photo.jpg');
    return fs.existsSync(defaultPhotoPath) ? fs.readFileSync(defaultPhotoPath) : null;
  }

  if (Buffer.isBuffer(photo)) {
    return photo;
  }

  try {
    const cleanBase64 = photo.includes('base64,') ? photo.split('base64,')[1] : photo;
    return Buffer.from(cleanBase64, 'base64');
  } catch {
    const defaultPhotoPath = getSlipAssetPath('default_mock_photo.jpg');
    return fs.existsSync(defaultPhotoPath) ? fs.readFileSync(defaultPhotoPath) : null;
  }
}

export async function generateDocxSlip(data: SlipData): Promise<Buffer> {
  const templatePath = getSlipAssetPath('ninslip.docx');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`DOCX template not found at ${templatePath}`);
  }

  const zip = new AdmZip(templatePath);
  let docXml = zip.readAsText('word/document.xml');

  // Strip spell-checking tags that break runs in Word
  docXml = docXml.replace(/<w:proofErr[^>]*\/>/g, '');

  const cleanNin = String(data.nin || '').replace(/\D/g, '');
  const cleanTrackingId = data.trackingId ? String(data.trackingId).replace(/[\s-]/g, '') : '';
  const genderChar = (data.gender || '').toUpperCase().startsWith('F') ? 'F' : 'M';

  const values: Record<string, string> = {
    trackid: cleanTrackingId,
    nin: cleanNin,
    surname: (data.surname || '').toUpperCase(),
    firstname: (data.firstName || '').toUpperCase(),
    middle: (data.middleName || '').toUpperCase(),
    gender: genderChar,
    address1: (data.addressLine1 || '').toUpperCase(),
    address: (data.address || '').toUpperCase(),
    state: (data.state || '').toUpperCase(),
  };

  // Replace tags across broken runs (address1 before address to prevent partial collisions)
  const order = ['trackid', 'nin', 'surname', 'firstname', 'middle', 'gender', 'address1', 'address', 'state'];
  for (const tag of order) {
    const re = new RegExp('\\[(?:(?![\\[\\]]).)*?' + tag + '(?:(?![\\[\\]]).)*?\\]', 'gs');
    docXml = docXml.replace(re, values[tag] || '');
  }

  // Ensure regular font size 15 (7.5 pt)
  docXml = docXml.replace(/<w:sz w:val="\d+"\/>/g, '<w:sz w:val="15"/><w:szCs w:val="15"/>');

  zip.updateFile('word/document.xml', Buffer.from(docXml, 'utf-8'));

  // Inject photo into both slips (top and duplicate)
  const photoBuffer = resolveSlipPhotoBuffer(data.photo);
  if (photoBuffer) {
    zip.updateFile('word/media/image2.png', photoBuffer);
    zip.updateFile('word/media/image10.png', photoBuffer);
  }

  return zip.toBuffer();
}

export async function generatePdfSlip(data: SlipData): Promise<Buffer> {
  const bgPath = getSlipAssetPath('image1.jpg');
  if (!fs.existsSync(bgPath)) {
    throw new Error(`Background image not found at ${bgPath}`);
  }

  const bgBuffer = fs.readFileSync(bgPath);
  const photoBuffer = resolveSlipPhotoBuffer(data.photo);

  const pdfDoc = await PDFDocument.create();
  // Standard A4 portrait: 595.28 x 841.89 points
  const page = pdfDoc.addPage([595.28, 841.89]);
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
    } catch {
      const defaultPhotoPath = getSlipAssetPath('default_mock_photo.jpg');
      if (fs.existsSync(defaultPhotoPath)) {
        photoImage = await pdfDoc.embedJpg(fs.readFileSync(defaultPhotoPath));
      }
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

  const cleanNin = String(data.nin || '').replace(/\D/g, '');
  const cleanTrackingId = data.trackingId ? String(data.trackingId).replace(/[\s-]/g, '') : '';
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

    const drawField = (text: string | undefined, emuX: number, emuY: number, size = 7.5, color = rgb(0, 0, 0)) => {
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

    if (cleanTrackingId) {
      drawField(cleanTrackingId, 792785, 928624, 7.5);
    }
    drawField(cleanNin, 792785, 1317695, 7.5);
    drawField(data.surname, 2592865, 956509, 7.5);
    drawField(data.firstName, 2592677, 1314486, 7.5);
    drawField(data.middleName, 2598833, 1670684, 7.5);
    drawField(genderChar, 2592865, 1972564, 7.5);
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
