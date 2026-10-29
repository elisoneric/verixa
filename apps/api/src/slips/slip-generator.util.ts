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

  // Strip a14:imgLayer that could cause Word to mask or overlay hdphoto1 over image2.png
  docXml = docXml.replace(/<a14:imgLayer[^>]*>.*?<\/a14:imgLayer>/gs, '');

  const cleanNin = String(data.nin || '').replace(/\D/g, '');
  const rawTrackingId = data.trackingId || ((data as any).nin_id && !(data as any).nin_id.startsWith('JVBERi') && (data as any).nin_id.length < 50 ? (data as any).nin_id : '');
  const cleanTrackingId = rawTrackingId ? String(rawTrackingId).replace(/[\s-]/g, '') : '';
  const genderChar = (data.gender || '').toUpperCase().startsWith('F') ? 'F' : 'M';

  // Word-wrap long addresses across up to 2 lines inside Word text run
  const rawAddress = (data.address || (data as any).residence_address || (data as any).residence_address_line_1 || '').toUpperCase();
  const addressLines = wrapText(rawAddress, 28);
  const formattedAddress = addressLines.slice(0, 2).join('</w:t><w:br/><w:t>');

  const rawAddress1 = (data.addressLine1 || (data as any).lga || (data as any).residence_lga || '').toUpperCase();
  const rawState = (data.state || (data as any).residence_state || '').toUpperCase();

  const values: Record<string, string> = {
    trackid: cleanTrackingId,
    nin: cleanNin,
    surname: (data.surname || (data as any).last_name || '').toUpperCase(),
    firstname: (data.firstName || (data as any).first_name || (data as any).firstname || '').toUpperCase(),
    middle: (data.middleName || (data as any).middle_name || (data as any).middlename || '').toUpperCase(),
    gender: genderChar,
    address1: rawAddress1,
    address: formattedAddress,
    state: rawState,
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
    if (zip.getEntry('word/media/hdphoto1.wdp')) {
      zip.deleteFile('word/media/hdphoto1.wdp');
    }
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

  // 1. Nigerian Green Guilloche Security Wave Lines
  for (let w = 0; w < 6; w++) {
    const yBase = 18 + w * 22;
    const amp = 2.4 + (w % 3) * 1.4;
    for (let x = 6; x < 236; x += 3) {
      const y1 = yBase + Math.sin((x * 0.05) + w * 0.8) * amp;
      const y2 = yBase + Math.sin(((x + 3) * 0.05) + w * 0.8) * amp;
      page.drawLine({
        start: { x, y: y1 },
        end: { x: x + 3, y: y2 },
        thickness: 0.35,
        color: rgb(0.0, 0.45, 0.25),
        opacity: 0.18,
      });
    }
  }

  // 2. Gold Security Accents: EMV Smart Chip Contact Pad & Divider Lines
  const chipX = 236 * scaleX;
  const chipY = 153.01 - (58 + 44) * scaleY;
  const chipW = 54 * scaleX;
  const chipH = 44 * scaleY;

  page.drawRectangle({
    x: chipX,
    y: chipY,
    width: chipW,
    height: chipH,
    borderWidth: 0.8,
    borderColor: rgb(0.83, 0.69, 0.22),
    color: rgb(0.95, 0.88, 0.65),
    opacity: 0.88,
  });
  // Smart chip contact pin divisions
  page.drawLine({
    start: { x: chipX + chipW / 2, y: chipY },
    end: { x: chipX + chipW / 2, y: chipY + chipH },
    thickness: 0.4,
    color: rgb(0.65, 0.52, 0.15),
  });
  page.drawLine({
    start: { x: chipX, y: chipY + chipH * 0.33 },
    end: { x: chipX + chipW, y: chipY + chipH * 0.33 },
    thickness: 0.4,
    color: rgb(0.65, 0.52, 0.15),
  });
  page.drawLine({
    start: { x: chipX, y: chipY + chipH * 0.66 },
    end: { x: chipX + chipW, y: chipY + chipH * 0.66 },
    thickness: 0.4,
    color: rgb(0.65, 0.52, 0.15),
  });

  // Gold accent divider line above the NIN pill
  page.drawLine({
    start: { x: 12, y: 153.01 - 425 * scaleY },
    end: { x: 230, y: 153.01 - 425 * scaleY },
    thickness: 0.75,
    color: rgb(0.83, 0.69, 0.22),
  });

  // 3. Citizen Photo with Security Gold/Green Frame
  const photoBuffer = resolveSlipPhotoBuffer(data.photo);
  if (photoBuffer) {
    try {
      let photoImg: any;
      if (photoBuffer[0] === 0x89 && photoBuffer[1] === 0x50) {
        photoImg = await pdfDoc.embedPng(photoBuffer);
      } else {
        photoImg = await pdfDoc.embedJpg(photoBuffer);
      }
      // Photo border
      page.drawRectangle({
        x: 30 * scaleX - 1,
        y: 153.01 - (130 + 220) * scaleY - 1,
        width: 185 * scaleX + 2,
        height: 220 * scaleY + 2,
        borderWidth: 0.8,
        borderColor: rgb(0.83, 0.69, 0.22),
      });
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

  // 4. 2D QR Code Generation (NIMC standard payload)
  const cleanNin = String(data.nin || '').replace(/\D/g, '');
  const surname = (data.surname || (data as any).last_name || '').toUpperCase();
  const givenNames = [data.firstName || (data as any).first_name, data.middleName || (data as any).middle_name].filter(Boolean).join(' ').toUpperCase();
  const dob = formatNimcDate(data.birthdate || (data as any).dob || (data as any).date_of_birth);
  const genderChar = (data.gender || 'M').toUpperCase().startsWith('F') ? 'F' : 'M';

  const now = new Date();
  const issueDate = formatNimcDate(now.toISOString().slice(0, 10));
  const expDateObj = new Date(now);
  expDateObj.setFullYear(expDateObj.getFullYear() + 10);
  const expiryDate = formatNimcDate(expDateObj.toISOString().slice(0, 10));

  const qrPayload = `NIMC:NIN=${cleanNin};SURNAME=${surname};GIVEN=${givenNames};DOB=${data.birthdate || ''};SEX=${genderChar};ISSUE=${now.toISOString().slice(0, 10)};EXP=${expDateObj.toISOString().slice(0, 10)}`;
  const qrBuf = await qrcode.toBuffer(qrPayload, { type: 'png', width: 200, margin: 1 });
  const qrImg = await pdfDoc.embedPng(qrBuf);

  page.drawImage(qrImg, {
    x: 578 * scaleX,
    y: 153.01 - (48 + 200) * scaleY,
    width: 200 * scaleX,
    height: 200 * scaleY,
  });

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontCourierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // 5. Crisp Micro-Text
  page.drawText('FEDERAL REPUBLIC OF NIGERIA • NATIONAL IDENTITY MANAGEMENT COMMISSION • NIMC DIRECT • NOT TRANSFERABLE • OFFICIAL DOCUMENT', {
    x: 12,
    y: 153.01 - 432 * scaleY,
    size: 3.2,
    font: fontRegular,
    color: rgb(0.08, 0.38, 0.22),
  });
  page.drawText('NATIONAL IDENTITY CARD • VERIFIED CITIZEN IDENTITY RECORD • NIMC ACT NO. 23 OF 2007', {
    x: 35,
    y: 4.5,
    size: 3.2,
    font: fontRegular,
    color: rgb(0.08, 0.38, 0.22),
  });

  // 6. Draw Field Values
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
  const displayGiven = [data.firstName || (data as any).first_name, data.middleName || (data as any).middle_name].filter(Boolean).join(' , ').toUpperCase();
  drawField(displayGiven, 248, 249, 6.2, fontBold);
  drawField(dob, 248, 314, 5.8, fontBold);
  drawField(genderChar, 455, 314, 6.2, fontBold);
  drawField(issueDate, 605, 344, 5.4, fontBold);

  // 7. Formatted 11-digit NIN: 4-3-4 spaced inside translucent security pill
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
  const surname = (data.surname || (data as any).last_name || '').toUpperCase();
  const givenNames = [data.firstName || (data as any).first_name, data.middleName || (data as any).middle_name].filter(Boolean).join(' , ').toUpperCase();
  const dob = formatNimcDate(data.birthdate || (data as any).dob || (data as any).date_of_birth);
  const genderChar = (data.gender || 'M').toUpperCase().startsWith('F') ? 'F' : 'M';

  const now = new Date();
  const issueDate = formatNimcDate(now.toISOString().slice(0, 10));
  const expDateObj = new Date(now);
  expDateObj.setFullYear(expDateObj.getFullYear() + 10);
  const expiryDate = formatNimcDate(expDateObj.toISOString().slice(0, 10));

  const qrPayload = `NIMC:NIN=${cleanNin};SURNAME=${surname};GIVEN=${givenNames};DOB=${data.birthdate || ''};SEX=${genderChar};ISSUE=${now.toISOString().slice(0, 10)};EXP=${expDateObj.toISOString().slice(0, 10)}`;
  const qrDataUrl = await qrcode.toDataURL(qrPayload, { width: 200, margin: 1 });

  const ninStr = cleanNin.length === 11
    ? `${cleanNin.slice(0, 4)}   ${cleanNin.slice(4, 7)}   ${cleanNin.slice(7)}`
    : cleanNin;

  // Build Nigerian green sinusoidal guilloche curves
  const guillocheCurves: string[] = [];
  for (let w = 0; w < 10; w++) {
    const yBase = 50 + w * 42;
    const amp1 = 8 + (w % 4) * 3;
    const amp2 = 5 + (w % 3) * 2;
    let d = `M 0 ${yBase.toFixed(1)}`;
    for (let x = 0; x <= 800; x += 16) {
      const y = yBase + Math.sin(x * 0.018 + w * 0.7) * amp1 + Math.cos(x * 0.035 + w * 0.4) * amp2;
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    guillocheCurves.push(`<path d="${d}" fill="none" stroke="#008751" stroke-width="0.8" opacity="0.14"/>`);
  }
  for (let r = 0; r < 5; r++) {
    const radius = 70 + r * 25;
    guillocheCurves.push(`<circle cx="480" cy="240" r="${radius}" fill="none" stroke="#006338" stroke-dasharray="4,6" stroke-width="0.6" opacity="0.10"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 507" width="800" height="507" style="border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.12)">
    <defs>
      <clipPath id="cardPhotoClip">
        <rect x="30" y="130" width="185" height="220" rx="12" ry="12"/>
      </clipPath>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#BF953F"/>
        <stop offset="25%" stop-color="#FCF6BA"/>
        <stop offset="50%" stop-color="#B38728"/>
        <stop offset="75%" stop-color="#FBF5B7"/>
        <stop offset="100%" stop-color="#AA771C"/>
      </linearGradient>
      <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCE881"/>
        <stop offset="50%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#8C6511"/>
      </linearGradient>
    </defs>

    <!-- Background Template -->
    <image href="data:image/png;base64,${templateB64}" x="0" y="0" width="800" height="507"/>

    <!-- Nigerian Green Guilloche Security Overlay -->
    <g id="guillochePattern">
      ${guillocheCurves.join('\n      ')}
    </g>

    <!-- Nigerian Coat of Arms Security Watermark -->
    <g id="coatOfArmsWatermark" opacity="0.10" transform="translate(360, 95) scale(0.85)">
      <!-- Shield -->
      <path d="M 50 20 Q 150 20 150 70 C 150 140 100 170 100 180 C 100 170 50 140 50 70 Z" fill="#111111" stroke="#008751" stroke-width="2"/>
      <!-- Silver Y Pall (Niger & Benue River Confluence) -->
      <path d="M 65 20 L 95 85 L 95 170 L 105 170 L 105 85 L 135 20 L 120 20 L 100 70 L 80 20 Z" fill="#FFFFFF" opacity="0.95"/>
      <!-- Left Supporting Horse -->
      <path d="M 20 150 C 15 120 25 80 45 70 C 50 85 45 110 50 130 C 40 145 30 155 20 150 Z" fill="#F0F0F0" stroke="#CCCCCC" stroke-width="1.5"/>
      <circle cx="35" cy="65" r="8" fill="#F0F0F0"/>
      <!-- Right Supporting Horse -->
      <path d="M 180 150 C 185 120 175 80 155 70 C 150 85 155 110 150 130 C 160 145 170 155 180 150 Z" fill="#F0F0F0" stroke="#CCCCCC" stroke-width="1.5"/>
      <circle cx="165" cy="65" r="8" fill="#F0F0F0"/>
      <!-- Red Eagle atop Wreath -->
      <ellipse cx="100" cy="18" rx="18" ry="4" fill="#008751"/>
      <ellipse cx="100" cy="18" rx="10" ry="3" fill="#FFFFFF"/>
      <path d="M 100 0 C 85 -10 80 15 100 12 C 120 15 115 -10 100 0 Z" fill="#D32F2F"/>
      <!-- Flora Base and Motto Scroll -->
      <path d="M 30 165 Q 100 155 170 165 C 160 185 40 185 30 165 Z" fill="#008751"/>
      <rect x="35" y="172" width="130" height="15" rx="3" fill="#D4AF37"/>
      <text x="100" y="183" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="6.5" fill="#111111" letter-spacing="0.5">UNITY AND FAITH, PEACE AND PROGRESS</text>
    </g>

    <!-- Gold Security Accents: EMV Smart Chip Contact Pad -->
    <g id="smartChip" transform="translate(236, 58)">
      <rect width="56" height="46" rx="6" fill="url(#chipGrad)" stroke="#8C6511" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"/>
      <line x1="28" y1="0" x2="28" y2="46" stroke="#664606" stroke-width="1"/>
      <line x1="0" y1="15" x2="56" y2="15" stroke="#664606" stroke-width="1"/>
      <line x1="0" y1="31" x2="56" y2="31" stroke="#664606" stroke-width="1"/>
      <circle cx="28" cy="23" r="4" fill="#664606" opacity="0.3"/>
    </g>

    <!-- Gold Security Accent Divider & Border Pinstripe -->
    <line x1="240" y1="425" x2="760" y2="425" stroke="url(#goldGradient)" stroke-width="1.5"/>
    <rect x="4" y="4" width="792" height="499" rx="14" fill="none" stroke="url(#goldGradient)" stroke-width="1.5" opacity="0.8"/>

    <!-- Photo with Gold and Green Rounded Frame -->
    ${photoB64 ? `<image href="data:${photoMime};base64,${photoB64}" x="30" y="130" width="185" height="220" preserveAspectRatio="xMidYMid slice" clip-path="url(#cardPhotoClip)"/>` : ''}
    <rect x="29" y="129" width="187" height="222" rx="13" ry="13" fill="none" stroke="url(#goldGradient)" stroke-width="2"/>
    <rect x="31" y="131" width="183" height="218" rx="11" ry="11" fill="none" stroke="#008751" stroke-width="1" opacity="0.8"/>

    <!-- 2D QR Code -->
    <image href="${qrDataUrl}" x="578" y="48" width="200" height="200"/>

    <!-- Crisp Micro-Text Lines -->
    <text x="35" y="433" font-family="'Courier New', Courier, monospace" font-size="6" font-weight="bold" fill="#005A36" letter-spacing="1">FEDERAL REPUBLIC OF NIGERIA • NATIONAL IDENTITY MANAGEMENT COMMISSION • NIMC DIRECT • NOT TRANSFERABLE • OFFICIAL DOCUMENT</text>
    <text x="120" y="498" font-family="'Courier New', Courier, monospace" font-size="5.5" font-weight="bold" fill="#005A36" letter-spacing="1.2">NATIONAL IDENTITY CARD • VERIFIED CITIZEN IDENTITY RECORD • NIMC ACT NO. 23 OF 2007 • ID-1 SPECIFICATION</text>

    <!-- Demographic Text Fields -->
    <text x="248" y="190" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#0f0f0f">${surname}</text>
    <text x="248" y="253" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#0f0f0f">${givenNames}</text>
    <text x="248" y="318" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="18" fill="#0f0f0f">${dob}</text>
    <text x="455" y="318" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#0f0f0f">${genderChar}</text>
    <text x="605" y="348" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="18" fill="#0f0f0f">${issueDate}</text>

    <!-- 11-digit NIN centered in translucent security pill with gold micro-border -->
    <rect x="220" y="438" width="360" height="48" rx="24" fill="#ffffff" fill-opacity="0.82" stroke="url(#goldGradient)" stroke-width="1.5"/>
    <text x="400" y="473" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-weight="bold" font-size="34" fill="#0f0f0f" letter-spacing="3">${ninStr}</text>
  </svg>`;
}

export async function generatePaperSlipSvg(data: SlipData): Promise<string> {
  const bgPath = getSlipAssetPath('image1.jpg');
  const bgB64 = fs.existsSync(bgPath) ? fs.readFileSync(bgPath).toString('base64') : '';

  const photoBuf = resolveSlipPhotoBuffer(data.photo);
  const photoB64 = photoBuf ? photoBuf.toString('base64') : '';
  const photoMime = photoBuf && photoBuf[0] === 0x89 && photoBuf[1] === 0x50 ? 'image/png' : 'image/jpeg';

  const cleanNin = String(data.nin || '').replace(/\D/g, '');
  const rawTrackingId = data.trackingId || ((data as any).nin_id && !(data as any).nin_id.startsWith('JVBERi') && (data as any).nin_id.length < 50 ? (data as any).nin_id : '');
  const cleanTrackingId = rawTrackingId ? String(rawTrackingId).replace(/[\s-]/g, '') : '';
  const genderChar = (data.gender || 'M').toUpperCase().startsWith('F') ? 'F' : 'M';

  const surname = (data.surname || (data as any).last_name || '').toUpperCase();
  const firstName = (data.firstName || (data as any).first_name || (data as any).firstname || '').toUpperCase();
  const middleName = (data.middleName || (data as any).middle_name || (data as any).middlename || '').toUpperCase();

  const address = (data.address || (data as any).residence_address || (data as any).residence_address_line_1 || '').toUpperCase();
  const addressLines = wrapText(address, 28);
  const addressLine1 = (data.addressLine1 || (data as any).lga || (data as any).residence_lga || '').toUpperCase();
  const state = (data.state || (data as any).residence_state || '').toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1539 733" width="100%" height="auto" style="border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.12)">
    <!-- Background Paper Slip Image -->
    <image href="data:image/jpeg;base64,${bgB64}" x="0" y="0" width="1539" height="733"/>

    <!-- Citizen Photo -->
    ${photoB64 ? `<image href="data:${photoMime};base64,${photoB64}" x="1302" y="171" width="231" height="299" preserveAspectRatio="xMidYMid slice"/>` : ''}

    <!-- Demographic Text Overlays matching standard EMU coordinate positioning -->
    <text x="173" y="222" font-family="'Courier New', Courier, monospace" font-weight="bold" font-size="20" fill="#000000">${cleanTrackingId}</text>
    <text x="173" y="307" font-family="'Courier New', Courier, monospace" font-weight="bold" font-size="20" fill="#000000">${cleanNin}</text>
    <text x="567" y="228" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#000000">${surname}</text>
    <text x="567" y="306" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#000000">${firstName}</text>
    <text x="568" y="384" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#000000">${middleName}</text>
    <text x="567" y="450" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#000000">${genderChar}</text>
    ${addressLines[0] ? `<text x="898" y="255" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#000000">${addressLines[0]}</text>` : ''}
    ${addressLines[1] ? `<text x="898" y="280" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#000000">${addressLines[1]}</text>` : ''}
    <text x="898" y="430" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#000000">${addressLine1}</text>
    <text x="898" y="462" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#000000">${state}</text>
  </svg>`;
}

export const SlipGeneratorUtil = {
  generateDocxSlip,
  generatePdfSlip,
  generateDigitalNinCardPdf,
  generateDigitalNinCardSvg,
  generatePaperSlipSvg,
  getSlipAssetPath,
  resolveSlipPhotoBuffer,
  wrapText,
};

export const generateNimcCard = SlipGeneratorUtil.generateDigitalNinCardPdf;
export const generateStandardNinSlip = SlipGeneratorUtil.generatePdfSlip;



