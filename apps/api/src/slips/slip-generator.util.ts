import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as qrcode from 'qrcode';

export interface SlipData {
  nin: string;
  trackingId?: string;
  firstName?: string;
  surname?: string;
  middleName?: string;
  gender?: string;
  birthdate?: string;
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

export function wrapText(text: string | undefined, maxCharsPerLine = 28): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
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
  const rawTrackingId = data.trackingId || ((data as any).nin_id && !(data as any).nin_id.startsWith('JVBERi') && (data as any).nin_id.length < 50 ? (data as any).nin_id : '');
  const cleanTrackingId = rawTrackingId ? String(rawTrackingId).replace(/[\s-]/g, '') : '';
  const genderChar = (data.gender || '').toUpperCase().startsWith('F') ? 'F' : 'M';

  // Word-wrap long addresses across up to 2 lines inside Word text run
  const addressLines = wrapText((data.address || '').toUpperCase(), 28);
  const formattedAddress = addressLines.slice(0, 2).join('</w:t><w:br/><w:t>');

  const values: Record<string, string> = {
    trackid: cleanTrackingId,
    nin: cleanNin,
    surname: (data.surname || '').toUpperCase(),
    firstname: (data.firstName || '').toUpperCase(),
    middle: (data.middleName || '').toUpperCase(),
    gender: genderChar,
    address1: (data.addressLine1 || '').toUpperCase(),
    address: formattedAddress,
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

  // Inject photo into slip (image2 is DrawingML, image10 is VML fallback)
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
  const rawTrackingId = data.trackingId || ((data as any).nin_id && !(data as any).nin_id.startsWith('JVBERi') && (data as any).nin_id.length < 50 ? (data as any).nin_id : '');
  const cleanTrackingId = rawTrackingId ? String(rawTrackingId).replace(/[\s-]/g, '') : '';
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

    // Multi-line address wrapping: if address exceeds 28 chars, wrap to 2nd line
    const addressLines = wrapText((data.address || '').toUpperCase(), 28);
    addressLines.slice(0, 2).forEach((line, idx) => {
      drawField(line, 4104725, 1081024 + idx * 115000, 7.5);
    });

    drawField(data.addressLine1, 4104873, 1881124, 7.5);
    drawField(data.state, 4104873, 2025904, 7.5);

    return slipY;
  };

  // Render single official government slip at standard top margin (no duplicate, no tear line)
  renderSlip(pageHeight - 35);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export function formatNimcDate(rawDate?: string): string {
  if (!rawDate) return '';
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const day = String(d.getDate()).padStart(2, '0');
      const mon = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day}  ${mon}  ${year}`;
    }
  } catch {}
  return String(rawDate).toUpperCase();
}

export async function generateDigitalNinCardPdf(data: SlipData): Promise<Buffer> {
  const templatePath = getSlipAssetPath('nin_card_template.png');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`NIN card template not found at ${templatePath}`);
  }

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.create();

  // Standard ID-1 card dimensions: 85.6mm x 53.98mm = 242.65 x 153.01 pt
  const page = pdfDoc.addPage([242.65, 153.01]);
  const templateImg = await pdfDoc.embedPng(templateBytes);
  page.drawImage(templateImg, { x: 0, y: 0, width: 242.65, height: 153.01 });

  const scaleX = 242.65 / 800.0;
  const scaleY = 153.01 / 507.0;

  // Citizen Photo
  const photoBuffer = resolveSlipPhotoBuffer(data.photo);
  if (photoBuffer) {
    try {
      let photoImg: any;
      if (photoBuffer[0] === 0x89 && photoBuffer[1] === 0x50) {
        photoImg = await pdfDoc.embedPng(photoBuffer);
      } else {
        photoImg = await pdfDoc.embedJpg(photoBuffer);
      }
      page.drawImage(photoImg, {
        x: 30 * scaleX,
        y: 153.01 - (130 + 220) * scaleY,
        width: 185 * scaleX,
        height: 220 * scaleY,
      });
    } catch {
      const defaultPhotoPath = getSlipAssetPath('default_mock_photo.jpg');
      if (fs.existsSync(defaultPhotoPath)) {
        const photoImg = await pdfDoc.embedJpg(fs.readFileSync(defaultPhotoPath));
        page.drawImage(photoImg, {
          x: 30 * scaleX,
          y: 153.01 - (130 + 220) * scaleY,
          width: 185 * scaleX,
          height: 220 * scaleY,
        });
      }
    }
  }

  // 2D QR Code Generation
  const cleanNin = String(data.nin || '').replace(/\D/g, '');
  const surname = (data.surname || '').toUpperCase();
  const givenNames = [data.firstName, data.middleName].filter(Boolean).join(' ').toUpperCase();
  const dob = formatNimcDate(data.birthdate);
  const genderChar = (data.gender || 'M').toUpperCase().startsWith('F') ? 'F' : 'M';
  const issueDate = formatNimcDate(new Date().toISOString().slice(0, 10));

  const qrPayload = `NIMC:NIN=${cleanNin};SURNAME=${surname};GIVEN=${givenNames};DOB=${data.birthdate || ''};SEX=${genderChar};ISSUE=${new Date().toISOString().slice(0, 10)}`;
  const qrBuf = await qrcode.toBuffer(qrPayload, { type: 'png', width: 200, margin: 1 });
  const qrImg = await pdfDoc.embedPng(qrBuf);

  page.drawImage(qrImg, {
    x: 578 * scaleX,
    y: 153.01 - (48 + 200) * scaleY,
    width: 200 * scaleX,
    height: 200 * scaleY,
  });

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontCourierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const drawField = (txt: string, imgX: number, imgY: number, size = 6, font = fontBold) => {
    if (!txt) return;
    page.drawText(txt, {
      x: imgX * scaleX,
      y: 153.01 - imgY * scaleY,
      size,
      font,
      color: rgb(0.06, 0.06, 0.06),
    });
  };

  drawField(surname, 248, 186, 6.2, fontBold);
  const displayGiven = [data.firstName, data.middleName].filter(Boolean).join(' , ').toUpperCase();
  drawField(displayGiven, 248, 249, 6.2, fontBold);
  drawField(dob, 248, 314, 5.8, fontBold);
  drawField(genderChar, 455, 314, 6.2, fontBold);
  drawField(issueDate, 605, 344, 5.4, fontBold);

  // Formatted 11-digit NIN: 4-3-4 spaced
  const ninStr = cleanNin.length === 11
    ? `${cleanNin.slice(0, 4)}   ${cleanNin.slice(4, 7)}   ${cleanNin.slice(7)}`
    : cleanNin;
  const ninWidth = fontCourierBold.widthOfTextAtSize(ninStr, 11);
  const ninX = (242.65 - ninWidth) / 2;
  page.drawText(ninStr, {
    x: ninX,
    y: 153.01 - 468 * scaleY,
    size: 11,
    font: fontCourierBold,
    color: rgb(0.05, 0.05, 0.05),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateDigitalNinCardSvg(data: SlipData): Promise<string> {
  const templatePath = getSlipAssetPath('nin_card_template.png');
  const templateB64 = fs.existsSync(templatePath) ? fs.readFileSync(templatePath).toString('base64') : '';
  
  const photoBuf = resolveSlipPhotoBuffer(data.photo);
  const photoB64 = photoBuf ? photoBuf.toString('base64') : '';
  const photoMime = photoBuf && photoBuf[0] === 0x89 && photoBuf[1] === 0x50 ? 'image/png' : 'image/jpeg';

  const cleanNin = String(data.nin || '').replace(/\D/g, '');
  const surname = (data.surname || '').toUpperCase();
  const givenNames = [data.firstName, data.middleName].filter(Boolean).join(' , ').toUpperCase();
  const dob = formatNimcDate(data.birthdate);
  const genderChar = (data.gender || 'M').toUpperCase().startsWith('F') ? 'F' : 'M';
  const issueDate = formatNimcDate(new Date().toISOString().slice(0, 10));

  const qrPayload = `NIMC:NIN=${cleanNin};SURNAME=${surname};GIVEN=${givenNames};DOB=${data.birthdate || ''};SEX=${genderChar};ISSUE=${new Date().toISOString().slice(0, 10)}`;
  const qrDataUrl = await qrcode.toDataURL(qrPayload, { width: 200, margin: 1 });

  const ninStr = cleanNin.length === 11
    ? `${cleanNin.slice(0, 4)}   ${cleanNin.slice(4, 7)}   ${cleanNin.slice(7)}`
    : cleanNin;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 507" width="800" height="507" style="border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.12)">
    <defs>
      <clipPath id="cardPhotoClip">
        <rect x="30" y="130" width="185" height="220" rx="12" ry="12"/>
      </clipPath>
    </defs>
    <!-- Background Template -->
    <image href="data:image/png;base64,${templateB64}" x="0" y="0" width="800" height="507"/>
    
    <!-- Photo with rounded frame -->
    ${photoB64 ? `<image href="data:${photoMime};base64,${photoB64}" x="30" y="130" width="185" height="220" preserveAspectRatio="xMidYMid slice" clip-path="url(#cardPhotoClip)"/>` : ''}
    <rect x="30" y="130" width="185" height="220" rx="12" ry="12" fill="none" stroke="#a0c0a0" stroke-width="2"/>

    <!-- QR Code -->
    <image href="${qrDataUrl}" x="578" y="48" width="200" height="200"/>

    <!-- Text Fields -->
    <text x="248" y="190" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#0f0f0f">${surname}</text>
    <text x="248" y="253" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#0f0f0f">${givenNames}</text>
    <text x="248" y="318" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="18" fill="#0f0f0f">${dob}</text>
    <text x="455" y="318" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#0f0f0f">${genderChar}</text>
    <text x="605" y="348" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="18" fill="#0f0f0f">${issueDate}</text>

    <!-- 11-digit NIN centered in translucent security pill -->
    <text x="400" y="470" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-weight="bold" font-size="40" fill="#0f0f0f" letter-spacing="2">${ninStr}</text>
  </svg>`;
}

