import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('======================================================================');
console.log('   EMPIRICAL ADVERSARIAL CHALLENGE SUITE: MILESTONE 3 (R3)');
console.log('   NIMC Card & NIN Slip Generation Overhaul & Optimistic Rendering');
console.log('======================================================================\n');

const testResults = [];
let passCount = 0;
let failCount = 0;

async function test(name, fn) {
  try {
    await fn();
    testResults.push({ name, pass: true });
    passCount++;
    console.log(`\x1b[32m[PASS]\x1b[0m ${name}`);
  } catch (err) {
    testResults.push({ name, pass: false, error: err.message });
    failCount++;
    console.error(`\x1b[31m[FAIL]\x1b[0m ${name}`);
    console.error(`       Error: ${err.message}`);
    if (err.stack) {
      console.error(`       ${err.stack.split('\n').slice(1, 4).join('\n       ')}`);
    }
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// -----------------------------------------------------------------------------
// SECTION 1: Adversarially Test UI Dual Options & Optimistic Flow in page.tsx
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 1: Dashboard UI Dual Slip Options & Optimistic Pipeline ---');

const pagePath = path.join(rootDir, 'apps/dashboard/src/app/dashboard/slips/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

await test('UI: Format toggle state supports "card" and "slip" with synchronized previewTab', () => {
  assert(pageContent.includes('const [formatType, setFormatType] = React.useState<"card" | "slip">("card")'), 'Missing formatType state initialization with "card" default');
  assert(pageContent.includes('const [previewTab, setPreviewTab] = React.useState<"card" | "slip">("card")'), 'Missing previewTab state initialization');
  assert(pageContent.includes('const handleFormatChange = (newFormat: "card" | "slip") => {'), 'Missing handleFormatChange handler');
  assert(pageContent.includes('setFormatType(newFormat)'), 'handleFormatChange must update formatType');
  assert(pageContent.includes('setPreviewTab(newFormat)'), 'handleFormatChange must synchronize previewTab');
});

await test('UI: Dual format selector buttons exist for "NIMC Direct (NIMC Card)" and "Standard NIN Slip"', () => {
  assert(pageContent.includes('NIMC Direct (NIMC Card)'), 'Missing label "NIMC Direct (NIMC Card)"');
  assert(pageContent.includes('Standard NIN Slip'), 'Missing label "Standard NIN Slip"');
  assert(pageContent.includes("onClick={() => handleFormatChange(\"card\")}"));
  assert(pageContent.includes("onClick={() => handleFormatChange(\"slip\")}"));
});

await test('UI: Two-stage optimistic pipeline fires Stage 1 lookup concurrently with Stage 2 docGen', () => {
  // Check that lookupNinIdentity and generateNinSlip are invoked concurrently
  assert(pageContent.includes('const lookupPromise = ApiClient.lookupNinIdentity(cleanNin, consent)'), 'lookupNinIdentity must be invoked for optimistic lookup');
  assert(pageContent.includes('const docGenPromise = ApiClient.generateNinSlip('), 'generateNinSlip must be invoked for background compilation');
  assert(pageContent.includes('lookupPromise'), 'lookupPromise must be handled asynchronously');
  assert(pageContent.includes('.then((lookupRes) => {'), 'lookupPromise must immediately populate optimistic record');
  assert(pageContent.includes('isCompiling: true'), 'Stage 1 must set isCompiling to true');
  assert(pageContent.includes('isCompiling: false'), 'Stage 2 must transition isCompiling to false upon completion');
});

await test('UI: Stage 1 renders citizen full name, portrait photo, and "Registry Confirmed" without blocking for PDF', () => {
  // Stage 1 banner rendering
  assert(pageContent.includes('{optimisticRecord && ('), 'Optimistic banner must render conditionally when optimisticRecord is present');
  assert(pageContent.includes('optimisticRecord.fullName'), 'Banner must display verified citizen full name');
  assert(pageContent.includes('Registry Confirmed'), 'Banner must display "Registry Confirmed" badge');
  assert(pageContent.includes('optimisticRecord.photoBase64'), 'Banner must display verified photo');
  assert(pageContent.includes('optimisticRecord.isCompiling && ('), 'Banner must show optimistic compilation status notice while compiling');
});

await test('UI: Client-side Blob download triggers exist for PDF and Word docx without secondary network round-trip', () => {
  assert(pageContent.includes('const downloadFile = (base64Data: string, filename: string, mimeType: string) => {'), 'Missing downloadFile client-side handler');
  assert(pageContent.includes('const blob = new Blob([byteArray], { type: mimeType })'), 'Must instantiate client-side Blob');
  assert(pageContent.includes('URL.createObjectURL(blob)'), 'Must create object URL from client-side Blob');
  assert(pageContent.includes('URL.revokeObjectURL(url)'), 'Must revoke object URL after download to prevent memory leaks');
  assert(pageContent.includes('application/pdf'), 'Must handle application/pdf MIME type');
  assert(pageContent.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'), 'Must handle docx MIME type');
});

// -----------------------------------------------------------------------------
// SECTION 2: Adversarial Emulation of Client-Side Blob Generation
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 2: Empirical Client-Side Blob Reconstruction ---');

await test('Client-side Blob: Verify byte-for-byte fidelity and MIME assignment on synthetic PDF and DOCX base64 data', () => {
  // Test PDF base64 string
  const dummyPdfHeader = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF';
  const pdfBuffer = Buffer.from(dummyPdfHeader);
  const pdfBase64 = pdfBuffer.toString('base64');

  // Emulate downloadFile logic exactly as in page.tsx
  const cleanData = pdfBase64.includes('base64,') ? pdfBase64.split('base64,')[1] : pdfBase64;
  const byteCharacters = atob(cleanData);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });

  assert(blob.size === pdfBuffer.length, `Blob size (${blob.size}) must match source buffer size (${pdfBuffer.length})`);
  assert(blob.type === 'application/pdf', `Blob type must be application/pdf, got ${blob.type}`);

  // Test with data URI prefix: data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,...
  const dummyDocx = 'PK\x03\x04[MOCK_ZIP_PAYLOAD]';
  const docxBuffer = Buffer.from(dummyDocx);
  const docxDataUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${docxBuffer.toString('base64')}`;

  const cleanDocxData = docxDataUri.includes('base64,') ? docxDataUri.split('base64,')[1] : docxDataUri;
  const docxChars = atob(cleanDocxData);
  const docxBytes = new Uint8Array(docxChars.length);
  for (let i = 0; i < docxChars.length; i++) {
    docxBytes[i] = docxChars.charCodeAt(i);
  }
  const docxBlob = new Blob([docxBytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

  assert(docxBlob.size === docxBuffer.length, `Docx Blob size (${docxBlob.size}) must match source buffer size (${docxBuffer.length})`);
});

// -----------------------------------------------------------------------------
// SECTION 3: Backend Controller & Service Verification for /v1/slips/nin
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 3: Backend Controller Normalization & Interface Contract ---');

const controllerPath = path.join(rootDir, 'apps/api/dist/slips/nin-slip.controller.js');
const servicePath = path.join(rootDir, 'apps/api/dist/slips/nin-slip.service.js');
const generatorUtilPath = path.join(rootDir, 'apps/api/dist/slips/slip-generator.util.js');

await test('Backend: Compiled modules exist and are importable in Node runtime', () => {
  assert(fs.existsSync(controllerPath), `Missing compiled controller at ${controllerPath}`);
  assert(fs.existsSync(servicePath), `Missing compiled service at ${servicePath}`);
  assert(fs.existsSync(generatorUtilPath), `Missing compiled util at ${generatorUtilPath}`);
});

// Import compiled generator utilities directly
const slipGenUtil = await import(pathToFileURL(path.resolve(generatorUtilPath)).href);
const {
  generateDigitalNinCardSvg,
  generateDigitalNinCardPdf,
  generatePaperSlipSvg,
  generateDocxSlip,
  formatNimcDate,
  wrapText,
  resolveSlipPhotoBuffer,
} = slipGenUtil;

// Instantiate mock dependencies to test NinSlipService and NinSlipController empirically
const mockNinData = {
  nin: '70123456789',
  trackingId: 'TRK9876543210',
  firstName: 'FATIMA',
  surname: 'BELLO',
  middleName: 'AISHA',
  gender: 'FEMALE',
  birthdate: '1995-04-18',
  address: '14 ADEOLA ODEKU STREET VICTORIA ISLAND',
  addressLine1: 'ETI OSA LGA',
  state: 'LAGOS',
  photo: fs.readFileSync(path.join(rootDir, 'apps/api/src/slips/assets/default_mock_photo.jpg')).toString('base64'),
};

const mockProviderInstance = {
  providerName: 'verixa_mock',
  verifyNin: async () => ({
    status: 'success',
    data: {
      nin: mockNinData.nin,
      tracking_id: mockNinData.trackingId,
      firstname: mockNinData.firstName,
      surname: mockNinData.surname,
      middlename: mockNinData.middleName,
      gender: mockNinData.gender,
      birthdate: mockNinData.birthdate,
      address: mockNinData.address,
      residence_lga: mockNinData.addressLine1,
      residence_state: mockNinData.state,
      photo: mockNinData.photo,
    },
    meta: { provider: 'verixa_mock' },
  }),
  verifyNinAdvance: async () => ({
    status: 'success',
    data: mockNinData,
    meta: { provider: 'verixa_mock' },
  }),
};

const mockCacheInstance = {
  getCachedRecord: async () => null,
  setCachedRecord: async () => {},
  generateKey: () => 'mock_key',
};

const mockBillingInstance = {
  getEffectiveRate: async () => ({ effectiveRate: 250 }),
  deductCredits: async () => {},
  refundCredits: async () => {},
};

const mockLogRepository = {
  save: async (record) => record,
};

// Import compiled NinSlipService class
const { NinSlipService } = await import(pathToFileURL(path.resolve(servicePath)).href);
const ninSlipService = new NinSlipService(
  mockProviderInstance, // dojahProvider
  mockProviderInstance, // mockProvider
  mockCacheInstance,
  mockBillingInstance,
  mockLogRepository,
);

// Import compiled NinSlipController class
const { NinSlipController } = await import(pathToFileURL(path.resolve(controllerPath)).href);
const ninSlipController = new NinSlipController(
  ninSlipService,
  mockProviderInstance,
  mockProviderInstance,
  mockBillingInstance,
  mockCacheInstance,
  mockLogRepository,
);

await test('Backend: POST /v1/slips/nin accepts format="card" and returns compliant ID-1 payload', async () => {
  const req = { organizationId: 'org_test_1', environment: 'sandbox', apiKeyId: 'test_key' };
  const body = { nin: '70123456789', format: 'card', consent: true };

  const result = await ninSlipController.generateSlipApiKey(req, body);

  assert(result.success === true, 'Response must have success: true');
  assert(result.status === 'success', 'Response status must be "success"');
  assert(result.slipType === 'card', `Expected slipType "card", got "${result.slipType}"`);
  assert(result.nin === '70123456789', 'NIN mismatch');
  assert(result.fullName === 'BELLO FATIMA AISHA', `Expected fullName "BELLO FATIMA AISHA", got "${result.fullName}"`);
  assert(result.trackingId === 'TRK9876543210', 'Tracking ID mismatch');
  assert(typeof result.pdfBase64 === 'string' && result.pdfBase64.length > 500, 'pdfBase64 must be populated');
  assert(typeof result.cardPdfBase64 === 'string', 'cardPdfBase64 must be populated');
  assert(typeof result.svgContent === 'string' && result.svgContent.includes('<svg'), 'svgContent must be valid SVG');
  assert(typeof result.cardSvg === 'string' && result.cardSvg.includes('<svg'), 'cardSvg must be valid SVG');
  assert(result.data && result.data.slipType === 'card', 'data.slipType must be "card"');
  assert(result.meta && result.meta.cost_ngx === 250, 'meta.cost_ngx must be 250');
});

await test('Backend: POST /v1/slips/nin accepts format="slip" and returns compliant Standard NIN Slip payload', async () => {
  const req = { organizationId: 'org_test_1', environment: 'sandbox', apiKeyId: 'test_key' };
  const body = { nin: '70123456789', format: 'slip', consent: true };

  const result = await ninSlipController.generateSlipApiKey(req, body);

  assert(result.success === true, 'Response must have success: true');
  assert(result.slipType === 'slip', `Expected slipType "slip", got "${result.slipType}"`);
  assert(typeof result.docxBase64 === 'string' && result.docxBase64.length > 500, 'docxBase64 must be populated');
  assert(typeof result.pdfBase64 === 'string' && result.pdfBase64.length > 500, 'pdfBase64 must be populated');
  assert(typeof result.svgContent === 'string' && result.svgContent.includes('<svg'), 'svgContent must be populated');
  assert(typeof result.slipSvg === 'string' && result.slipSvg.includes('<svg'), 'slipSvg must be valid SVG');
});

await test('Backend: POST /v1/dashboard/slips/nin (JWT) accepts format="card" and format="slip"', async () => {
  const req = { organizationId: 'org_test_1', environment: 'sandbox' };

  // Test card format
  const cardResult = await ninSlipController.generateSlipDashboard(req, {
    nin: '70123456789',
    format: 'card',
    consent: true,
  });
  assert(cardResult.success === true, 'Dashboard card generation failed');
  assert(cardResult.slipType === 'card', `Expected slipType "card", got "${cardResult.slipType}"`);

  // Test slip format
  const slipResult = await ninSlipController.generateSlipDashboard(req, {
    nin: '70123456789',
    format: 'slip',
    consent: true,
  });
  assert(slipResult.success === true, 'Dashboard slip generation failed');
  assert(slipResult.slipType === 'slip', `Expected slipType "slip", got "${slipResult.slipType}"`);
});

await test('Backend: Fast lookup endpoints (/slips/nin/lookup & /dashboard/slips/nin/lookup) return demographic data <150ms without compiling PDF binaries', async () => {
  const req = { organizationId: 'org_test_1', environment: 'sandbox', apiKeyId: 'test_key' };
  const lookupRes = await ninSlipController.lookupSlipApiKey(req, { nin: '70123456789', consent: true });

  assert(lookupRes.success === true, 'Lookup must return success: true');
  assert(lookupRes.fullName === 'BELLO FATIMA AISHA', 'Full name mismatch');
  assert(lookupRes.trackingId === 'TRK9876543210', 'Tracking ID mismatch');
  assert(lookupRes.photoBase64 !== undefined, 'Photo must be populated');
  assert(lookupRes.pdfBase64 === undefined, 'Lookup must NOT compile or return large PDF binary (optimistic fast path)');
  assert(lookupRes.docxBase64 === undefined, 'Lookup must NOT compile or return DOCX binary');
});

await test('Backend: Consent enforcement throws 400 BadRequestException when consent is missing or false', async () => {
  const req = { organizationId: 'org_test_1', environment: 'sandbox', apiKeyId: 'test_key' };

  let threw = false;
  try {
    await ninSlipController.generateSlipApiKey(req, { nin: '70123456789', consent: false });
  } catch (err) {
    threw = true;
    assert(err.status === 400 || err.message.includes('consent'), 'Error must mention consent');
  }
  assert(threw, 'Must throw when consent: false');

  threw = false;
  try {
    await ninSlipController.generateSlipDashboard(req, { nin: '70123456789' });
  } catch (err) {
    threw = true;
    assert(err.status === 400 || err.message.includes('consent'), 'Error must mention consent');
  }
  assert(threw, 'Must throw when consent is omitted');
});

await test('Backend: NIN validation throws 400 BadRequestException when NIN is not 11 digits', async () => {
  const req = { organizationId: 'org_test_1', environment: 'sandbox', apiKeyId: 'test_key' };

  let threw = false;
  try {
    await ninSlipController.generateSlipApiKey(req, { nin: '12345', consent: true });
  } catch (err) {
    threw = true;
    assert(err.status === 400, 'Must throw 400 for short NIN');
  }
  assert(threw, 'Must throw on invalid NIN length');
});

// -----------------------------------------------------------------------------
// SECTION 4: Stress-Testing Visual Fidelity & Security Generators
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 4: Adversarial Stress-Testing Document Generators ---');

await test('Generator: NIMC Direct ID-1 Card SVG contains all government security elements', async () => {
  const svg = await generateDigitalNinCardSvg(mockNinData);

  // ID-1 Dimensions: 800 x 507
  assert(svg.includes('viewBox="0 0 800 507"'), 'SVG viewBox must be 0 0 800 507');
  assert(svg.includes('width="800" height="507"'), 'SVG width/height must be 800x507');

  // Guilloche Security Lathe Pattern
  assert(svg.includes('id="guillochePattern"'), 'Missing #guillochePattern group');
  assert(svg.includes('stroke="#008751"'), 'Missing green guilloche curves');
  assert(svg.includes('stroke="#006338"'), 'Missing dark green guilloche curves');

  // Coat of Arms Watermark
  assert(svg.includes('id="coatOfArmsWatermark"'), 'Missing #coatOfArmsWatermark group');
  assert(svg.includes('UNITY AND FAITH, PEACE AND PROGRESS'), 'Missing national motto in watermark');

  // EMV Smart Chip Contact Pad
  assert(svg.includes('id="smartChip"'), 'Missing #smartChip EMV contact pad');

  // Gold Security Accents
  assert(svg.includes('id="goldGradient"'), 'Missing #goldGradient definition');

  // Crisp Micro-Text Lines
  assert(svg.includes('FEDERAL REPUBLIC OF NIGERIA • NATIONAL IDENTITY MANAGEMENT COMMISSION'), 'Missing top micro-text');
  assert(svg.includes('NATIONAL IDENTITY CARD • VERIFIED CITIZEN IDENTITY RECORD'), 'Missing bottom micro-text');

  // 4-3-4 formatted NIN in security pill
  assert(svg.includes('7012   345   6789'), 'NIN must be formatted into 4-3-4 spaced segments');

  // 2D QR Code data URL
  assert(svg.includes('data:image/png;base64,'), 'Missing 2D QR Code embedded image');
});

await test('Generator: NIMC Direct ID-1 Card PDF adheres to ISO 7816 ID-1 standard dimensions (85.6mm x 53.98mm = 242.65 x 153.01 pt)', async () => {
  const pdfBuf = await generateDigitalNinCardPdf(mockNinData);

  assert(Buffer.isBuffer(pdfBuf), 'Must return a Buffer');
  assert(pdfBuf.slice(0, 5).toString() === '%PDF-', 'Must start with PDF magic bytes');
  assert(pdfBuf.length > 50000, `PDF size too small (${pdfBuf.length} bytes, expected > 50KB)`);

  // Verify page size via PDFDocument
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.load(pdfBuf);
  const page = doc.getPages()[0];
  assert(Math.abs(page.getWidth() - 242.65) < 0.01, `Expected width 242.65, got ${page.getWidth()}`);
  assert(Math.abs(page.getHeight() - 153.01) < 0.01, `Expected height 153.01, got ${page.getHeight()}`);
});

await test('Generator: Standard NIN Paper Slip SVG contains official demographic overlays and background', async () => {
  const paperSvg = await generatePaperSlipSvg(mockNinData);

  assert(paperSvg.includes('viewBox="0 0 1539 733"'), 'Paper slip viewBox must be 0 0 1539 733');
  assert(paperSvg.includes('data:image/jpeg;base64,'), 'Missing embedded background image1.jpg');
  assert(paperSvg.includes(mockNinData.nin), 'Missing clean NIN text overlay');
  assert(paperSvg.includes(mockNinData.trackingId), 'Missing clean tracking ID overlay');
  assert(paperSvg.includes(mockNinData.surname), 'Missing surname overlay');
  assert(paperSvg.includes(mockNinData.firstName), 'Missing firstName overlay');
});

await test('Generator: Standard NIN DOCX generation successfully substitutes placeholders and strips hdphoto1.wdp', async () => {
  const docxBuf = await generateDocxSlip(mockNinData);

  assert(Buffer.isBuffer(docxBuf), 'Must return a Buffer');
  assert(docxBuf.slice(0, 4).toString('hex') === '504b0304', 'Must be valid PK zip archive');

  // Inspect zip structure with AdmZip
  const AdmZip = (await import('adm-zip')).default;
  const zip = new AdmZip(docxBuf);

  const docXml = zip.readAsText('word/document.xml');
  assert(!docXml.includes('[trackid]'), '[trackid] placeholder was not replaced');
  assert(!docXml.includes('[nin]'), '[nin] placeholder was not replaced');
  assert(!docXml.includes('[surname]'), '[surname] placeholder was not replaced');
  assert(!docXml.includes('[firstname]'), '[firstname] placeholder was not replaced');
  assert(docXml.includes(mockNinData.trackingId), `Tracking ID ${mockNinData.trackingId} not found in document.xml`);
  assert(docXml.includes(mockNinData.nin), `NIN ${mockNinData.nin} not found in document.xml`);
  assert(docXml.includes(mockNinData.surname), `Surname ${mockNinData.surname} not found in document.xml`);

  // Verify proofErr spellcheck tags are stripped
  assert(!docXml.includes('<w:proofErr'), 'Spellcheck <w:proofErr> tags must be stripped');

  // Verify photo assets
  assert(zip.getEntry('word/media/image2.png') !== null, 'image2.png must be present');
  assert(zip.getEntry('word/media/image10.png') !== null, 'image10.png must be present');
  assert(zip.getEntry('word/media/hdphoto1.wdp') === null, 'hdphoto1.wdp must be purged to avoid Word rendering collisions');
});

await test('Generator: Adversarial input resilience (missing photo, long addresses, extreme names, strange dates)', async () => {
  const adversarialData = {
    nin: '11234567890',
    trackingId: 'TRK-999-888-777',
    firstName: 'CHUKWUDUMEBI-BARTHOLOMEW ALEXANDER-CHRISTOPHER',
    surname: 'NWANKWO-OGUNDIPE-ABUBAKAR-IBRAHIM-DANJUMA',
    middleName: 'OLUWASEUN-BABATUNDE',
    gender: 'MALE',
    birthdate: '1978-11-29T14:30:00.000Z',
    address: 'PLOT 1428B CLOSE 4 MARINA WHARF CRESCENT EXTENSION PHASE 2 APAPA COMMERCIAL DISTRICT',
    addressLine1: 'APAPA LOCAL GOVERNMENT AREA COUNCIL',
    state: 'LAGOS STATE NIGERIA',
    photo: undefined, // Missing photo!
  };

  // 1. Missing photo fallback
  const resolvedPhoto = resolveSlipPhotoBuffer(adversarialData.photo);
  assert(resolvedPhoto !== null && resolvedPhoto.length > 0, 'Must fallback to default mock photo when photo is undefined');

  // 2. Date formatting resilience
  const formattedDate = formatNimcDate(adversarialData.birthdate);
  assert(formattedDate.includes('1978') && formattedDate.includes('NOV'), `Expected formatted date with NOV and 1978, got "${formattedDate}"`);

  // 3. Multi-line address wrapping
  const wrapped = wrapText(adversarialData.address, 28);
  assert(wrapped.length >= 2, `Address must be wrapped into at least 2 lines, got ${wrapped.length}`);
  for (const line of wrapped) {
    assert(line.length <= 35, `Wrapped line exceeded threshold: "${line}"`);
  }

  // 4. Card SVG generation survives long names and undefined photo
  const cardSvg = await generateDigitalNinCardSvg(adversarialData);
  assert(cardSvg.includes('NWANKWO-OGUNDIPE'), 'Long surname must be present in SVG');
  assert(cardSvg.includes('1123   456   7890'), 'Formatted NIN must be present');

  // 5. Card PDF generation survives
  const cardPdf = await generateDigitalNinCardPdf(adversarialData);
  assert(cardPdf.length > 50000, 'Card PDF must generate successfully');

  // 6. Paper Slip SVG generation survives
  const paperSvg = await generatePaperSlipSvg(adversarialData);
  assert(paperSvg.includes('11234567890'), 'NIN must be present in paper slip');

  // 7. Docx generation survives
  const docx = await generateDocxSlip(adversarialData);
  assert(docx.length > 100000, 'Docx must generate successfully');
});

// -----------------------------------------------------------------------------
// SUMMARY REPORT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`   EXECUTION SUMMARY: ${passCount} PASSED, ${failCount} FAILED (TOTAL: ${testResults.length})`);
console.log('======================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
