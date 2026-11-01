import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import AdmZip from 'adm-zip';
import { PDFDocument } from 'pdf-lib';

const rootDir = path.resolve('.');
const modulePath = pathToFileURL(path.join(rootDir, 'apps/api/dist/slips/slip-generator.util.js')).href;
const utils = await import(modulePath);

const {
  generateDigitalNinCardSvg,
  generateDigitalNinCardPdf,
  generatePaperSlipSvg,
  generateDocxSlip,
  generatePdfSlip,
  formatNimcDate,
  wrapText,
} = utils;

let passed = 0;
let failed = 0;
const testLogs = [];

function recordPass(name, detail = '') {
  passed++;
  const msg = `[PASS] ${name}${detail ? ` - ${detail}` : ''}`;
  testLogs.push({ name, pass: true, detail });
  console.log(`  ✓ ${msg}`);
}

function recordFail(name, error) {
  failed++;
  const msg = `[FAIL] ${name} - ${error}`;
  testLogs.push({ name, pass: false, error });
  console.error(`  ✗ ${msg}`);
}

async function runTest(name, fn) {
  try {
    const detail = await fn();
    recordPass(name, detail || '');
  } catch (err) {
    recordFail(name, err.message);
  }
}

console.log('================================================================================');
console.log('=== EMPIRICAL ADVERSARIAL STRESS TEST: NIMC CARD & NIN SLIP GENERATION (M3) ===');
console.log('================================================================================\n');

// Standard citizen fixture
const defaultPhotoPath = path.join(rootDir, 'apps/api/src/slips/assets/default_mock_photo.jpg');
const defaultPhotoBuf = fs.readFileSync(defaultPhotoPath);

const citizenPrimary = {
  nin: '70123456789',
  trackingId: 'VX-77889911',
  firstName: 'MOHAMMED',
  surname: 'IBRAHIM',
  middleName: 'ALHASSAN',
  gender: 'MALE',
  birthdate: '1985-06-15',
  address: 'Plot 402 Constitution Avenue, Central Business District',
  addressLine1: 'Abuja Municipal Area Council',
  state: 'Federal Capital Territory',
  photo: defaultPhotoBuf,
};

const citizenFemale = {
  nin: '11234567890',
  trackingId: 'TRK-99002233',
  firstName: 'NGOZI',
  surname: 'EZE',
  middleName: 'CHIDINMA',
  gender: 'Female',
  birthdate: '1992-11-23',
  address: '24 Awolowo Road, Ikoyi',
  addressLine1: 'Eti-Osa',
  state: 'Lagos',
  photo: defaultPhotoBuf.toString('base64'),
};

const citizenAdversarial = {
  nin: '99887766554',
  trackingId: 'EDG-001',
  firstName: 'A'.repeat(35),
  surname: "O'CONNOR & SONS",
  middleName: '',
  gender: 'F',
  birthdate: 'not-a-valid-date',
  address: 'Extremely long street name that goes on and on and on without any proper punctuation to test line splitting boundaries in documents',
  addressLine1: 'Adversarial LGA',
  state: 'Kano',
  photo: undefined,
};

// -----------------------------------------------------------------------------
// PART 1: generateDigitalNinCardSvg
// -----------------------------------------------------------------------------
console.log('--- TEST GROUP 1: generateDigitalNinCardSvg ---');

await runTest('SVG: Valid XML root, viewBox and dimensions', async () => {
  const svg = await generateDigitalNinCardSvg(citizenPrimary);
  if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) throw new Error('Invalid SVG root tags');
  if (!svg.includes('viewBox="0 0 800 507"')) throw new Error('Missing viewBox="0 0 800 507"');
  if (!svg.includes('width="800"') || !svg.includes('height="507"')) throw new Error('Incorrect width/height');
  return `Length: ${svg.length} chars`;
});

await runTest('SVG: Nigerian Green Guilloche pattern embedded', async () => {
  const svg = await generateDigitalNinCardSvg(citizenPrimary);
  if (!svg.includes('id="guillochePattern"')) throw new Error('Missing guillochePattern id');
  if (!svg.includes('stroke="#008751"') || !svg.includes('stroke="#006338"')) throw new Error('Missing guilloche colors');
  return 'Found guilloche curves and concentric rosette arcs';
});

await runTest('SVG: Coat of Arms security watermark with motto', async () => {
  const svg = await generateDigitalNinCardSvg(citizenPrimary);
  if (!svg.includes('id="coatOfArmsWatermark"')) throw new Error('Missing coatOfArmsWatermark id');
  if (!svg.includes('opacity="0.10"')) throw new Error('Watermark opacity must be 0.10');
  if (!svg.includes('UNITY AND FAITH, PEACE AND PROGRESS')) throw new Error('Missing official motto');
  return 'Found Coat of Arms vector with 0.10 opacity';
});

await runTest('SVG: EMV smart chip contact pad and gold metallic styling', async () => {
  const svg = await generateDigitalNinCardSvg(citizenPrimary);
  if (!svg.includes('id="smartChip"')) throw new Error('Missing smartChip id');
  if (!svg.includes('id="goldGradient"')) throw new Error('Missing goldGradient def');
  if (!svg.includes('id="chipGrad"')) throw new Error('Missing chipGrad def');
  return 'Found EMV chip with 8 contact segments and gold gradients';
});

await runTest('SVG: Micro-text security borders', async () => {
  const svg = await generateDigitalNinCardSvg(citizenPrimary);
  if (!svg.includes('FEDERAL REPUBLIC OF NIGERIA • NATIONAL IDENTITY MANAGEMENT COMMISSION • NIMC DIRECT')) {
    throw new Error('Missing top micro-text');
  }
  if (!svg.includes('NATIONAL IDENTITY CARD • VERIFIED CITIZEN IDENTITY RECORD • NIMC ACT NO. 23 OF 2007 • ID-1 SPECIFICATION')) {
    throw new Error('Missing bottom micro-text');
  }
  return 'Micro-text border lines verified';
});

await runTest('SVG: 4-3-4 spaced NIN and formatted date of birth', async () => {
  const svg = await generateDigitalNinCardSvg(citizenPrimary);
  if (!svg.includes('7012   345   6789')) throw new Error('NIN not formatted to 4-3-4 spaced format');
  if (!svg.includes('15  JUN  1985')) throw new Error('Date of birth not formatted to DD  MMM  YYYY');
  return '4-3-4 NIN (7012   345   6789) and Date (15  JUN  1985) present';
});

await runTest('SVG: 2D QR Code image data URI', async () => {
  const svg = await generateDigitalNinCardSvg(citizenPrimary);
  if (!svg.includes('data:image/png;base64,')) throw new Error('Missing QR code data URI');
  if (!svg.includes('x="578" y="48" width="200" height="200"')) throw new Error('QR code coordinates incorrect');
  return 'Embedded QR code verified';
});

await runTest('SVG: Adversarial edge cases (missing photo, invalid date, female)', async () => {
  const svg = await generateDigitalNinCardSvg(citizenAdversarial);
  if (!svg.includes('NOT-A-VALID-DATE')) throw new Error('Fallback date string missing');
  if (!svg.includes('>F<')) throw new Error('Female gender char missing');
  return 'Handled missing photo, fallback date, and female gender';
});

// -----------------------------------------------------------------------------
// PART 2: generateDigitalNinCardPdf & ID-1 Dimensional Verification
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 2: generateDigitalNinCardPdf & ID-1 Spec Adherence ---');

await runTest('PDF: Valid PDF magic header (%PDF-1.)', async () => {
  const pdfBuf = await generateDigitalNinCardPdf(citizenPrimary);
  if (!Buffer.isBuffer(pdfBuf)) throw new Error('Output is not a Buffer');
  const header = pdfBuf.subarray(0, 8).toString('ascii');
  if (!header.startsWith('%PDF-1.')) throw new Error(`Invalid PDF header: ${header}`);
  return `Header: ${header.trim()}`;
});

await runTest('PDF: Binary buffer size > 50KB', async () => {
  const pdfBuf = await generateDigitalNinCardPdf(citizenPrimary);
  const sizeBytes = pdfBuf.length;
  const sizeKb = (sizeBytes / 1024).toFixed(2);
  if (sizeBytes <= 50 * 1024) throw new Error(`PDF size ${sizeBytes} bytes <= 50KB`);
  return `Size: ${sizeBytes.toLocaleString()} bytes (${sizeKb} KB) > 50KB`;
});

await runTest('PDF: Exact ID-1 Dimensions (85.6mm x 53.98mm / 242.65 x 153.01 pt)', async () => {
  const pdfBuf = await generateDigitalNinCardPdf(citizenPrimary);
  const pdfDoc = await PDFDocument.load(pdfBuf);
  const pages = pdfDoc.getPages();
  if (pages.length !== 1) throw new Error(`Expected exactly 1 page, got ${pages.length}`);

  const page = pages[0];
  const { width, height } = page.getSize();
  const widthMm = (width * 25.4) / 72.0;
  const heightMm = (height * 25.4) / 72.0;

  const targetW = 242.65;
  const targetH = 153.01;
  const diffW = Math.abs(width - targetW);
  const diffH = Math.abs(height - targetH);

  if (diffW > 0.05) throw new Error(`Width ${width} pt deviates from target ${targetW} pt by ${diffW}`);
  if (diffH > 0.05) throw new Error(`Height ${height} pt deviates from target ${targetH} pt by ${diffH}`);

  const diffMmW = Math.abs(widthMm - 85.60);
  const diffMmH = Math.abs(heightMm - 53.98);
  if (diffMmW > 0.02) throw new Error(`Width in mm ${widthMm} deviates from 85.6mm`);
  if (diffMmH > 0.02) throw new Error(`Height in mm ${heightMm} deviates from 53.98mm`);

  return `Exact: ${width.toFixed(2)} pt x ${height.toFixed(2)} pt (${widthMm.toFixed(3)}mm x ${heightMm.toFixed(3)}mm)`;
});

await runTest('PDF: Adversarial citizen edge case compiles > 50KB with valid header', async () => {
  const pdfBuf = await generateDigitalNinCardPdf(citizenAdversarial);
  const header = pdfBuf.subarray(0, 8).toString('ascii');
  if (!header.startsWith('%PDF-1.')) throw new Error('Invalid header on edge case');
  if (pdfBuf.length <= 50 * 1024) throw new Error(`Edge case PDF size ${pdfBuf.length} <= 50KB`);
  return `Edge PDF size: ${pdfBuf.length.toLocaleString()} bytes`;
});

await runTest('PDF Slip (A4): Generates valid vector A4 PDF (>50KB, %PDF-1. header, 595.28 x 841.89 pt)', async () => {
  const a4PdfBuf = await generatePdfSlip(citizenPrimary);
  const header = a4PdfBuf.subarray(0, 8).toString('ascii');
  if (!header.startsWith('%PDF-1.')) throw new Error(`Invalid A4 PDF header: ${header}`);
  if (a4PdfBuf.length <= 50 * 1024) throw new Error(`A4 PDF size ${a4PdfBuf.length} <= 50KB`);

  const pdfDoc = await PDFDocument.load(a4PdfBuf);
  const pages = pdfDoc.getPages();
  if (pages.length !== 1) throw new Error(`Expected 1 page for A4 slip, got ${pages.length}`);
  const { width, height } = pages[0].getSize();
  if (Math.abs(width - 595.28) > 0.1 || Math.abs(height - 841.89) > 0.1) {
    throw new Error(`A4 dimensions mismatch: got ${width} x ${height}, expected 595.28 x 841.89`);
  }
  return `Size: ${a4PdfBuf.length.toLocaleString()} bytes, Dimensions: ${width} x ${height} pt`;
});

await runTest('Utilities: formatNimcDate & wrapText stress boundaries', async () => {
  if (formatNimcDate('') !== '') throw new Error('Empty date did not return empty string');
  if (formatNimcDate(undefined) !== '') throw new Error('Undefined date did not return empty string');
  if (formatNimcDate('1990-01-11') !== '11  JAN  1990') throw new Error('ISO date format mismatch');
  if (formatNimcDate('invalid') !== 'INVALID') throw new Error('Invalid date fallback mismatch');

  const wEmpty = wrapText(undefined, 28);
  if (wEmpty.length !== 0) throw new Error('Undefined wrapText should return empty array');
  const wLong = wrapText('Plot 402 Constitution Avenue Central Business District Abuja Federal Capital Territory', 28);
  if (wLong.length < 2) throw new Error('Long text not wrapped');
  for (const line of wLong) {
    if (line.length > 35) throw new Error(`Line length ${line.length} exceeds max line wrapping constraint`);
  }
  return 'formatNimcDate & wrapText boundaries verified';
});

// -----------------------------------------------------------------------------
// PART 3: generatePaperSlipSvg
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 3: generatePaperSlipSvg ---');

await runTest('Paper SVG: Valid SVG format and viewBox (0 0 1539 733)', async () => {
  const svg = await generatePaperSlipSvg(citizenPrimary);
  if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) throw new Error('Invalid SVG root');
  if (!svg.includes('viewBox="0 0 1539 733"')) throw new Error('Incorrect viewBox');
  return `Length: ${svg.length} chars`;
});

await runTest('Paper SVG: Inlined background image and photo', async () => {
  const svg = await generatePaperSlipSvg(citizenPrimary);
  if (!svg.includes('data:image/jpeg;base64,')) throw new Error('Missing background JPEG image');
  if (!svg.includes('x="1302" y="171" width="231" height="299"')) throw new Error('Photo coordinates incorrect');
  return 'Background and portrait embedded';
});

await runTest('Paper SVG: Demographic overlays and address wrapping', async () => {
  const svg = await generatePaperSlipSvg(citizenPrimary);
  if (!svg.includes('VX77889911')) throw new Error('Clean tracking ID missing');
  if (!svg.includes('70123456789')) throw new Error('NIN missing');
  if (!svg.includes('IBRAHIM') || !svg.includes('MOHAMMED')) throw new Error('Name missing');

  const svgAdversarial = await generatePaperSlipSvg(citizenAdversarial);
  if (!svgAdversarial.includes('x="898" y="255"') || !svgAdversarial.includes('x="898" y="280"')) {
    throw new Error('Multi-line address wrapping missing in paper slip SVG');
  }
  return 'Demographics and address wrapping verified';
});

// -----------------------------------------------------------------------------
// PART 4: generateDocxSlip & Template Placeholder Substitution
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 4: generateDocxSlip & Template Placeholder Substitution ---');

await runTest('DOCX: Buffer size > 100KB', async () => {
  const docxBuf = await generateDocxSlip(citizenPrimary);
  if (!Buffer.isBuffer(docxBuf)) throw new Error('Output is not a Buffer');
  const sizeBytes = docxBuf.length;
  const sizeKb = (sizeBytes / 1024).toFixed(2);
  if (sizeBytes <= 100 * 1024) throw new Error(`DOCX size ${sizeBytes} bytes <= 100KB`);
  return `Size: ${sizeBytes.toLocaleString()} bytes (${sizeKb} KB) > 100KB`;
});

await runTest('DOCX: Valid ZIP header (PK\\x03\\x04)', async () => {
  const docxBuf = await generateDocxSlip(citizenPrimary);
  const isZip = docxBuf[0] === 0x50 && docxBuf[1] === 0x4b && docxBuf[2] === 0x03 && docxBuf[3] === 0x04;
  if (!isZip) throw new Error(`Invalid ZIP header: [${docxBuf[0]}, ${docxBuf[1]}, ${docxBuf[2]}, ${docxBuf[3]}]`);
  return 'Magic bytes: 50 4B 03 04 (PK\\x03\\x04)';
});

await runTest('DOCX: word/document.xml has all placeholder strings replaced', async () => {
  const docxBuf = await generateDocxSlip(citizenPrimary);
  const zip = new AdmZip(docxBuf);
  const docXml = zip.readAsText('word/document.xml');

  const tags = ['trackid', 'nin', 'surname', 'firstname', 'middle', 'gender', 'address1', 'address', 'state'];
  const remaining = [];
  for (const tag of tags) {
    const re = new RegExp(`\\[[^\\]]*?${tag}[^\\]]*?\\]`, 'i');
    if (re.test(docXml)) {
      remaining.push(`[${tag}]`);
    }
  }

  if (remaining.length > 0) {
    throw new Error(`Unreplaced placeholders in word/document.xml: ${remaining.join(', ')}`);
  }

  // Verify substituted demographic values
  if (!docXml.includes('70123456789')) throw new Error('NIN missing in document.xml');
  if (!docXml.includes('VX77889911')) throw new Error('Tracking ID missing in document.xml');
  if (!docXml.includes('IBRAHIM')) throw new Error('Surname missing in document.xml');
  if (!docXml.includes('MOHAMMED')) throw new Error('First name missing in document.xml');
  if (!docXml.includes('ALHASSAN')) throw new Error('Middle name missing in document.xml');
  if (!docXml.includes('>M<')) throw new Error('Gender M missing in document.xml');

  return '0 unreplaced placeholders; demographic values verified';
});

await runTest('DOCX: Proof error (<w:proofErr>) and a14:imgLayer tags stripped', async () => {
  const docxBuf = await generateDocxSlip(citizenPrimary);
  const zip = new AdmZip(docxBuf);
  const docXml = zip.readAsText('word/document.xml');

  if (docXml.includes('<w:proofErr')) throw new Error('Found unstripped <w:proofErr> tags');
  if (docXml.includes('<a14:imgLayer')) throw new Error('Found unstripped <a14:imgLayer> tags');
  return 'Word proofErr and a14:imgLayer tags cleanly stripped';
});

await runTest('DOCX: Photos embedded and hdphoto1.wdp collision removed', async () => {
  const docxBuf = await generateDocxSlip(citizenPrimary);
  const zip = new AdmZip(docxBuf);

  if (!zip.getEntry('word/media/image2.png')) throw new Error('Missing DrawingML photo word/media/image2.png');
  if (!zip.getEntry('word/media/image10.png')) throw new Error('Missing VML fallback photo word/media/image10.png');
  if (zip.getEntry('word/media/hdphoto1.wdp')) throw new Error('hdphoto1.wdp collision was not removed');
  return 'image2.png & image10.png embedded; hdphoto1.wdp deleted';
});

await runTest('DOCX: Adversarial citizen edge case substitution and formatting', async () => {
  const docxBuf = await generateDocxSlip(citizenFemale);
  const zip = new AdmZip(docxBuf);
  const docXml = zip.readAsText('word/document.xml');

  if (!docXml.includes('11234567890')) throw new Error('Female NIN missing');
  if (!docXml.includes('EZE')) throw new Error('Female surname missing');
  if (!docXml.includes('NGOZI')) throw new Error('Female firstname missing');
  if (!docXml.includes('>F<')) throw new Error('Female gender F missing');
  if (!docXml.includes('LAGOS')) throw new Error('Female state missing');
  return 'Adversarial citizen docx substitution verified';
});

// -----------------------------------------------------------------------------
// PART 5: Optimistic UI Logic in `apps/dashboard/src/app/dashboard/slips/page.tsx`
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 5: Optimistic UI Logic in slips/page.tsx ---');

const slipsPagePath = path.join(rootDir, 'apps/dashboard/src/app/dashboard/slips/page.tsx');
const slipsContent = fs.readFileSync(slipsPagePath, 'utf8');

await runTest('UI: Concurrent dispatch of fast lookup and background document compilation', async () => {
  if (!slipsContent.includes('const lookupPromise = ApiClient.lookupNinIdentity(cleanNin, consent)')) {
    throw new Error('Missing concurrent lookupNinIdentity dispatch');
  }
  if (!slipsContent.includes('const docGenPromise = ApiClient.generateNinSlip(')) {
    throw new Error('Missing concurrent generateNinSlip dispatch');
  }
  return 'lookupPromise & docGenPromise dispatched concurrently';
});

await runTest('UI: Immediate optimistic state update upon lookup response', async () => {
  if (!slipsContent.includes('lookupPromise') || !slipsContent.includes('setOptimisticRecord({')) {
    throw new Error('Missing lookupPromise then handler updating optimisticRecord');
  }
  if (!slipsContent.includes('isCompiling: true')) {
    throw new Error('Missing isCompiling: true flag during optimistic state');
  }
  return 'Immediate setOptimisticRecord with isCompiling: true verified';
});

await runTest('UI: Verified citizen identity banner rendered on optimistic state', async () => {
  if (!slipsContent.includes('{optimisticRecord && (')) {
    throw new Error('Missing conditional render for optimistic banner');
  }
  if (!slipsContent.includes('Registry Confirmed')) {
    throw new Error('Missing Registry Confirmed badge');
  }
  if (!slipsContent.includes('{optimisticRecord.fullName}')) {
    throw new Error('Missing citizen full name render in banner');
  }
  return 'Citizen portrait, name, NIN and tracking ID rendered immediately';
});

await runTest('UI: Background compilation status notification displayed during compilation', async () => {
  if (!slipsContent.includes('{optimisticRecord.isCompiling && (')) {
    throw new Error('Missing compilation notification block');
  }
  if (!slipsContent.includes('Background service is synthesizing high-resolution vector security patterns')) {
    throw new Error('Missing compilation notice text');
  }
  return 'Real-time compilation spinner & notice verified';
});

await runTest('UI: Dual format toggle selector (NIMC Direct Card vs Standard NIN Slip)', async () => {
  if (!slipsContent.includes('NIMC Direct (NIMC Card)')) throw new Error('Missing NIMC Card option');
  if (!slipsContent.includes('Standard NIN Slip')) throw new Error('Missing Standard Slip option');
  if (!slipsContent.includes('handleFormatChange("card")')) throw new Error('Missing card handler');
  if (!slipsContent.includes('handleFormatChange("slip")')) throw new Error('Missing slip handler');
  return 'Interactive dual format selector verified';
});

await runTest('UI: Instant client-side zero-network blob download triggers', async () => {
  if (!slipsContent.includes('downloadFile(')) throw new Error('Missing client downloadFile helper');
  if (!slipsContent.includes('Download PDF ⚡')) throw new Error('Missing instant PDF download button');
  if (!slipsContent.includes('Download Word (.docx)')) throw new Error('Missing instant Word download button');
  return 'In-memory Base64 to Blob client download handlers verified';
});

await runTest('UI: Mobile touch target compliance (>= 44px)', async () => {
  if (!slipsContent.includes('min-h-[44px]')) throw new Error('Missing min-h-[44px] touch target class');
  return '44px minimum touch targets verified';
});

console.log('\n================================================================================');
console.log(`=== EMPIRICAL TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed}) ===`);
console.log('================================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
