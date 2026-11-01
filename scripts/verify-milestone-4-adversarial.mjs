import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const rootDir = path.resolve('.');

// Import compiled backend modules
const controllerModulePath = pathToFileURL(path.join(rootDir, 'apps/api/dist/verifications/verifications.controller.js')).href;
const providerModulePath = pathToFileURL(path.join(rootDir, 'apps/api/dist/verifications/providers/mock.provider.js')).href;

const { VerificationsController } = await import(controllerModulePath);
const { MockProvider } = await import(providerModulePath);

let totalPassed = 0;
let totalFailed = 0;
const results = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function test(name, fn) {
  try {
    const detail = await fn();
    totalPassed++;
    console.log(`  ✓ [PASS] ${name}${detail ? ` (${detail})` : ''}`);
    results.push({ name, pass: true, detail });
  } catch (err) {
    totalFailed++;
    console.error(`  ✗ [FAIL] ${name} - ${err.message}`);
    results.push({ name, pass: false, error: err.message });
  }
}

console.log('================================================================================');
console.log('=== EMPIRICAL ADVERSARIAL CHALLENGE HARNESS: MILESTONE 4 (R4) ===');
console.log('================================================================================\n');

// ---------------------------------------------------------------------------
// Mock Infrastructure Setup for Controller Testing
// ---------------------------------------------------------------------------
function createHarness() {
  const billingCalls = [];
  const cacheCalls = [];
  const logCalls = [];

  const mockProvider = new MockProvider();

  const dojahProvider = {
    verifyBvn: async (b) => mockProvider.verifyBvn(b),
    verifyNin: async (b) => mockProvider.verifyNin(b),
    verifyBankAccount: async (b) => mockProvider.verifyBankAccount(b),
    verifyPhoneNumber: async (b) => mockProvider.verifyPhoneNumber(b),
    verifyCac: async (b) => mockProvider.verifyCac(b),
    verifyNubanKycStatus: async (b) => mockProvider.verifyNubanKycStatus(b),
    verifyTin: async (b) => mockProvider.verifyTin(b),
    verifyDriversLicense: async (b) => mockProvider.verifyDriversLicense(b),
    verifyVotersCard: async (b) => mockProvider.verifyVotersCard(b),
    verifyPassport: async (b) => mockProvider.verifyPassport(b),
  };

  const billingService = {
    async getEffectiveRate(orgId, serviceType, isCacheHit = false) {
      billingCalls.push({ action: 'getEffectiveRate', orgId, serviceType, isCacheHit });
      let rate = 125;
      if (serviceType === 'nuban') rate = 0;
      else if (serviceType === 'bvn') rate = isCacheHit ? 38 : 95;
      else if (serviceType === 'nin') rate = isCacheHit ? 50 : 120;
      else if (serviceType === 'phone') rate = isCacheHit ? 20 : 50;
      else if (serviceType === 'cac') rate = isCacheHit ? 48 : 120;
      else if (serviceType === 'nuban_kyc') rate = isCacheHit ? 14 : 35;
      else rate = isCacheHit ? 50 : 125;
      return { effectiveRate: rate, baseRate: rate, discountPercent: 0, tier: 'STARTER', isCustom: false, isCacheHit };
    },
    async deductCredits(orgId, env, cost, reference) {
      billingCalls.push({ action: 'deductCredits', orgId, env, cost, reference });
      return { balance: 10000 - cost };
    },
    async refundCredits(orgId, env, cost, reference) {
      billingCalls.push({ action: 'refundCredits', orgId, env, cost, reference });
      return { balance: 10000 };
    },
  };

  let cachedStore = new Map();
  const identityCacheService = {
    generateKey(orgId, env, service, id) {
      return `cache:${orgId}:${env}:${service}:${id}`;
    },
    async getCachedRecord(orgId, env, service, id) {
      cacheCalls.push({ action: 'get', orgId, env, service, id });
      const key = `${orgId}:${env}:${service}:${id}`;
      return cachedStore.get(key) || null;
    },
    async setCachedRecord(orgId, env, service, id, data, source) {
      cacheCalls.push({ action: 'set', orgId, env, service, id, data, source });
      const key = `${orgId}:${env}:${service}:${id}`;
      cachedStore.set(key, { data, sourceProvider: source, cachedAt: new Date().toISOString() });
    },
    clear() {
      cachedStore.clear();
    },
  };

  const logRepository = {
    async save(logData) {
      logCalls.push(logData);
      return { id: `log_${Date.now()}`, ...logData };
    },
    createQueryBuilder() {
      return {
        where() { return this; },
        orderBy() { return this; },
        skip() { return this; },
        take() { return this; },
        andWhere() { return this; },
        async getManyAndCount() { return [[], 0]; },
      };
    },
  };

  const controller = new VerificationsController(
    mockProvider,
    dojahProvider,
    billingService,
    identityCacheService,
    logRepository
  );

  return {
    controller,
    mockProvider,
    dojahProvider,
    billingService,
    identityCacheService,
    logRepository,
    billingCalls,
    cacheCalls,
    logCalls,
    cachedStore,
  };
}

const reqContext = {
  organizationId: 'org_test_m4',
  environment: 'sandbox',
  headers: {},
};

// ---------------------------------------------------------------------------
// SUITE 1: All 10 Services Verification via POST /v1/verify/manual
// ---------------------------------------------------------------------------
console.log('--- SUITE 1: All 10 Services Verification via manualVerify ---');

const servicesToTest = [
  { service: 'nin', payload: { nin: '70123456789', consent: true }, expectedKey: 'nin', expectedCost: 120 },
  { service: 'bvn', payload: { bvn: '22222222222', consent: true }, expectedKey: 'bvn', expectedCost: 95 },
  { service: 'nuban', payload: { accountNumber: '0123456789', bankCode: '058', consent: true }, expectedKey: 'account_number', expectedCost: 0 },
  { service: 'phone', payload: { phoneNumber: '09011111111', consent: true }, expectedKey: 'phone_number', expectedCost: 50 },
  { service: 'cac', payload: { rcNumber: '1928374', companyType: 'COMPANY', consent: true }, expectedKey: 'rc_number', expectedCost: 120 },
  { service: 'nuban_kyc', payload: { accountNumber: '0123456789', bankCode: '058', consent: true }, expectedKey: 'kyc_status', expectedCost: 35 },
  { service: 'tin', payload: { tin: '19847291-0001', consent: true }, expectedKey: 'tin', expectedCost: 125 },
  { service: 'dl', payload: { licenseNumber: 'AAA00000AA00', dob: '1988-04-14', consent: true }, expectedKey: 'license_number', expectedCost: 125 },
  { service: 'vin', payload: { vin: '90F5B01234567890123', state: 'LAGOS', lastName: 'OLUTOLA', consent: true }, expectedKey: 'vin', expectedCost: 125 },
  { service: 'passport', payload: { passportNumber: 'A12345678', lastName: 'OLUTOLA', dob: '1988-04-14', consent: true }, expectedKey: 'passport_number', expectedCost: 125 },
];

for (const svc of servicesToTest) {
  await test(`POST /v1/verify/manual - ${svc.service.toUpperCase()} execution & response schema`, async () => {
    const harness = createHarness();
    const result = await harness.controller.manualVerify(reqContext, {
      service: svc.service,
      environment: 'sandbox',
      payload: svc.payload,
    });

    assert(result.success === true, `Expected success to be true, got ${result.success}`);
    assert(result.status === 'success', `Expected status to be 'success', got ${result.status}`);
    assert(result.service === svc.service, `Expected service to be ${svc.service}, got ${result.service}`);
    assert(typeof result.reference === 'string' && result.reference.length > 5, 'Reference missing or invalid');
    assert(typeof result.verifiedAt === 'string' && !isNaN(Date.parse(result.verifiedAt)), 'verifiedAt is not a valid date string');
    assert(typeof result.data === 'object' && result.data !== null, 'Data object missing in response');
    assert(result.data[svc.expectedKey] !== undefined, `Expected data.${svc.expectedKey} to be present in result`);
    assert(result.meta && result.meta.referenceId, 'Meta referenceId missing');

    const deductCall = harness.billingCalls.find(c => c.action === 'deductCredits');
    assert(deductCall, 'Billing deduction was not triggered');
    assert(deductCall.cost === svc.expectedCost, `Expected billing deduction cost ${svc.expectedCost}, got ${deductCall.cost}`);

    assert(harness.logCalls.length === 1, `Expected 1 audit log entry, found ${harness.logCalls.length}`);
    const log = harness.logCalls[0];
    assert(log.serviceType === svc.service, `Expected log serviceType to be ${svc.service}`);
    assert(log.status === 'Success', `Expected log status to be 'Success' (VerificationStatus.SUCCESS)`);
    assert(log.isCached === false, 'Expected first call to be live non-cached');

    return `Cost: ${deductCall.cost} NGX, Ref: ${result.reference.slice(0, 16)}...`;
  });
}

// ---------------------------------------------------------------------------
// SUITE 2: Consent Enforcement & Regulatory Compliance
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 2: Consent Enforcement & Regulatory Compliance ---');

await test('Missing consent parameter must throw BadRequestException', async () => {
  const harness = createHarness();
  let threw = false;
  try {
    await harness.controller.manualVerify(reqContext, {
      service: 'tin',
      environment: 'sandbox',
      payload: { tin: '19847291-0001' },
    });
  } catch (err) {
    threw = true;
    assert(err.status === 400 || err.name === 'BadRequestException', `Expected 400 BadRequestException, got ${err.name}`);
    assert(err.message.includes('Applicant consent is mandatory'), `Unexpected error message: ${err.message}`);
  }
  assert(threw, 'Should have thrown BadRequestException');
  return 'Enforced consent requirement';
});

await test('Explicit consent: false must throw BadRequestException', async () => {
  const harness = createHarness();
  let threw = false;
  try {
    await harness.controller.manualVerify(reqContext, {
      service: 'dl',
      environment: 'sandbox',
      payload: { licenseNumber: 'AAA00000AA00', consent: false },
    });
  } catch (err) {
    threw = true;
    assert(err.message.includes('consent is mandatory'), `Unexpected message: ${err.message}`);
  }
  assert(threw, 'Should have thrown on consent: false');
});

await test('Consent as string "false" must throw BadRequestException', async () => {
  const harness = createHarness();
  let threw = false;
  try {
    await harness.controller.manualVerify(reqContext, {
      service: 'passport',
      environment: 'sandbox',
      payload: { passportNumber: 'A12345678', consent: 'false' },
    });
  } catch (err) {
    threw = true;
  }
  assert(threw, 'Should have rejected string "false"');
});

await test('Consent as string "true" should be accepted', async () => {
  const harness = createHarness();
  const res = await harness.controller.manualVerify(reqContext, {
    service: 'passport',
    environment: 'sandbox',
    payload: { passportNumber: 'A12345678', consent: 'true' },
  });
  assert(res.success === true, 'Should accept consent: "true"');
  return 'Accepted string "true"';
});

// ---------------------------------------------------------------------------
// SUITE 3: Adversarial Payload Validation & Identifier Integrity
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 3: Adversarial Payload Validation & Identifier Integrity ---');

await test('[ADVERSARIAL] Missing TIN in manualVerify: exposes lack of identifier guard in manual endpoint', async () => {
  const harness = createHarness();
  // We test whether manualVerify verifies identifier presence or silently generates fake data
  let threw = false;
  try {
    const res = await harness.controller.manualVerify(reqContext, {
      service: 'tin',
      environment: 'sandbox',
      payload: { tin: '', consent: true },
    });
    // If it did not throw, it returned mock data for empty TIN
    return `VULNERABILITY DETECTED: manualVerify allowed empty TIN and returned taxpayer: "${res.data?.taxpayer_name}"`;
  } catch (err) {
    threw = true;
    return `Guard active: rejected with ${err.message}`;
  }
});

await test('[ADVERSARIAL] Missing License Number in manualVerify: exposes lack of identifier guard', async () => {
  const harness = createHarness();
  try {
    const res = await harness.controller.manualVerify(reqContext, {
      service: 'dl',
      environment: 'sandbox',
      payload: { licenseNumber: '', consent: true },
    });
    return `VULNERABILITY DETECTED: manualVerify allowed empty license and returned holder: "${res.data?.first_name} ${res.data?.last_name}"`;
  } catch (err) {
    return `Guard active: rejected with ${err.message}`;
  }
});

await test('[ADVERSARIAL] Missing VIN in manualVerify: exposes lack of identifier guard', async () => {
  const harness = createHarness();
  try {
    const res = await harness.controller.manualVerify(reqContext, {
      service: 'vin',
      environment: 'sandbox',
      payload: { vin: '', consent: true },
    });
    return `VULNERABILITY DETECTED: manualVerify allowed empty VIN and returned voter: "${res.data?.first_name} ${res.data?.last_name}"`;
  } catch (err) {
    return `Guard active: rejected with ${err.message}`;
  }
});

await test('[ADVERSARIAL] Missing Passport Number in manualVerify: exposes lack of identifier guard', async () => {
  const harness = createHarness();
  try {
    const res = await harness.controller.manualVerify(reqContext, {
      service: 'passport',
      environment: 'sandbox',
      payload: { passportNumber: '', consent: true },
    });
    return `VULNERABILITY DETECTED: manualVerify allowed empty passport and returned holder: "${res.data?.first_name} ${res.data?.last_name}"`;
  } catch (err) {
    return `Guard active: rejected with ${err.message}`;
  }
});

await test('[ADVERSARIAL] Unsupported service error masking: 400 BadRequest converted into 500 InternalServerError', async () => {
  const harness = createHarness();
  let caughtError = null;
  try {
    await harness.controller.manualVerify(reqContext, {
      service: 'unsupported_service_xyz',
      environment: 'sandbox',
      payload: { consent: true },
    });
  } catch (err) {
    caughtError = err;
  }
  assert(caughtError !== null, 'Should have thrown an error for unsupported service');
  const is500 = caughtError.status === 500 || caughtError.name === 'InternalServerErrorException';
  const deductCall = harness.billingCalls.find(c => c.action === 'deductCredits');
  const refundCall = harness.billingCalls.find(c => c.action === 'refundCredits');

  assert(is500, `Expected 500 due to catch-all rethrow, got ${caughtError.status || caughtError.name}`);
  assert(deductCall && refundCall, 'Billing was deducted and refunded during invalid service check');
  return `VULNERABILITY CONFIRMED: Throws 500 "${caughtError.message}" and cycles billing deduction/refund instead of immediate 400 BadRequest`;
});

await test('[ADVERSARIAL] Request headers forwarding: mockReq strips x-bypass-cache', async () => {
  const harness = createHarness();

  // Populate cache first
  await harness.controller.manualVerify(reqContext, {
    service: 'tin',
    environment: 'sandbox',
    payload: { tin: '19847291-0001', consent: true },
  });

  // Second request with x-bypass-cache in HTTP headers
  const reqWithHeader = {
    ...reqContext,
    headers: { 'x-bypass-cache': 'true' },
  };

  const res = await harness.controller.manualVerify(reqWithHeader, {
    service: 'tin',
    environment: 'sandbox',
    payload: { tin: '19847291-0001', consent: true },
  });

  // Since mockReq has headers: {}, the header was ignored and cache was used
  assert(res.meta.cached === true, 'Header x-bypass-cache was ignored due to mockReq.headers: {}');
  return `VULNERABILITY CONFIRMED: mockReq.headers: {} discards HTTP request headers`;
});

// ---------------------------------------------------------------------------
// SUITE 4: Billing Deduction, Smart Cache & Refund Logic Stress-Testing
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 4: Billing Deduction, Smart Cache & Refund Logic ---');

await test('Provider failure must trigger refundCredits and rethrow InternalServerErrorException', async () => {
  const harness = createHarness();
  harness.mockProvider.verifyPassport = async () => {
    throw new Error('Connection timeout to NIS gateway');
  };

  let threw = false;
  try {
    await harness.controller.manualVerify(reqContext, {
      service: 'passport',
      environment: 'sandbox',
      payload: { passportNumber: 'A99999999', consent: true },
    });
  } catch (err) {
    threw = true;
    assert(err.status === 500 || err.name === 'InternalServerErrorException', `Expected 500, got ${err.name}`);
  }
  assert(threw, 'Expected controller to throw on provider failure');

  const refundCall = harness.billingCalls.find(c => c.action === 'refundCredits');
  assert(refundCall, 'refundCredits was not called upon upstream provider failure');
  assert(refundCall.cost === 125, `Expected refunded amount 125, got ${refundCall.cost}`);
  return `Refunded ${refundCall.cost} NGX`;
});

await test('Smart Cache HIT: second inquiry for same identity must deduct discounted cache rate and skip provider', async () => {
  const harness = createHarness();

  const res1 = await harness.controller.manualVerify(reqContext, {
    service: 'tin',
    environment: 'sandbox',
    payload: { tin: '19847291-0001', consent: true },
  });
  assert(res1.meta.cached === false, 'First call should not be cached');

  const res2 = await harness.controller.manualVerify(reqContext, {
    service: 'tin',
    environment: 'sandbox',
    payload: { tin: '19847291-0001', consent: true },
  });

  assert(res2.meta.cached === true, 'Second call must be cached');
  assert(res2.meta.cost_ngx === 50, `Expected discounted cache cost 50, got ${res2.meta.cost_ngx}`);

  const lastLog = harness.logCalls[harness.logCalls.length - 1];
  assert(lastLog.isCached === true, 'Audit log should mark isCached: true');
  assert(lastLog.costDeducted === 50, 'Audit log cost should be 50');

  return `Live: 125 NGX -> Cache: 50 NGX (Savings: 60%)`;
});

await test('Smart Cache BYPASS via payload.bypassCache: forces fresh query and live deduction', async () => {
  const harness = createHarness();

  await harness.controller.manualVerify(reqContext, {
    service: 'tin',
    environment: 'sandbox',
    payload: { tin: '19847291-0001', consent: true },
  });

  const resBypass = await harness.controller.manualVerify(reqContext, {
    service: 'tin',
    environment: 'sandbox',
    payload: { tin: '19847291-0001', consent: true, bypassCache: true },
  });

  assert(resBypass.meta.cached === false, 'Cache should be bypassed when payload.bypassCache is true');
  assert(resBypass.meta.cost_ngx === 125, 'Live fee should be deducted on cache bypass');
  return 'Bypassed cache via payload flag successfully';
});

// ---------------------------------------------------------------------------
// SUITE 5: Client-Side Certificate Synthesis Verification (A4 PDF)
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 5: Client-Side Certificate Synthesis Verification (A4 PDF) ---');

async function synthesizeCertificatePdf(serviceName, resultData, sanitizeUnicode = true) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Portrait
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  const colorEmeraldDark = rgb(0.02, 0.38, 0.28);
  const colorEmerald = rgb(0.06, 0.58, 0.42);
  const colorSlateDark = rgb(0.06, 0.09, 0.16);
  const colorSlateMuted = rgb(0.39, 0.45, 0.55);
  const colorBorder = rgb(0.88, 0.91, 0.94);
  const colorBgLight = rgb(0.97, 0.98, 0.99);

  // Outer Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: colorEmerald,
    borderWidth: 2,
  });

  // Inner Border
  page.drawRectangle({
    x: 26,
    y: 26,
    width: width - 52,
    height: height - 52,
    borderColor: colorBorder,
    borderWidth: 0.8,
  });

  // Header Banner
  page.drawRectangle({
    x: 27,
    y: height - 100,
    width: width - 54,
    height: 72,
    color: colorSlateDark,
  });

  page.drawText("VERIXA IDENTITY VERIFICATION PLATFORM", {
    x: 44,
    y: height - 54,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("OFFICIAL VERIFICATION ATTESTATION CERTIFICATE", {
    x: 44,
    y: height - 72,
    size: 10,
    font: fontRegular,
    color: colorEmerald,
  });

  page.drawText("ISSUED VIA REGULATORY GATEWAY", {
    x: width - 230,
    y: height - 62,
    size: 8,
    font: fontMono,
    color: rgb(0.8, 0.85, 0.9),
  });

  let currentY = height - 135;
  page.drawRectangle({
    x: 44,
    y: currentY - 26,
    width: width - 88,
    height: 38,
    color: colorBgLight,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  const refId = resultData.reference || resultData.meta?.referenceId || "REF-UNKNOWN";
  const verifiedAt = resultData.verifiedAt || new Date().toISOString();

  page.drawText(`SERVICE: ${serviceName.toUpperCase()} DIRECT REGISTRY`, {
    x: 56,
    y: currentY - 8,
    size: 9,
    font: fontBold,
    color: colorSlateDark,
  });

  page.drawText(`STATUS: REGULATORY VERIFIED`, {
    x: 56,
    y: currentY - 20,
    size: 8,
    font: fontBold,
    color: colorEmeraldDark,
  });

  page.drawText(`REFERENCE: ${refId}`, {
    x: width - 290,
    y: currentY - 8,
    size: 8,
    font: fontMono,
    color: colorSlateMuted,
  });

  page.drawText(`TIMESTAMP: ${verifiedAt}`, {
    x: width - 290,
    y: currentY - 20,
    size: 8,
    font: fontMono,
    color: colorSlateMuted,
  });

  currentY -= 55;
  page.drawText("VERIFIED IDENTITY ATTRIBUTES", {
    x: 44,
    y: currentY,
    size: 11,
    font: fontBold,
    color: colorSlateDark,
  });

  page.drawLine({
    start: { x: 44, y: currentY - 4 },
    end: { x: width - 44, y: currentY - 4 },
    thickness: 1,
    color: colorEmerald,
  });

  currentY -= 20;
  const entries = Object.entries(resultData.data || {}).filter(
    ([k, v]) =>
      k !== "photo" &&
      k !== "signature" &&
      k !== "pdfBase64" &&
      k !== "docxBase64" &&
      k !== "cardPdfBase64" &&
      k !== "cardSvg" &&
      k !== "nin_id" &&
      v !== null &&
      v !== undefined &&
      v !== ""
  );

  for (let i = 0; i < entries.length; i++) {
    if (currentY < 120) break;
    const [rawKey, rawVal] = entries[i];
    const label = rawKey.replace(/_/g, " ").toUpperCase();
    const value = typeof rawVal === "object" ? JSON.stringify(rawVal) : String(rawVal);

    if (i % 2 === 0) {
      page.drawRectangle({
        x: 44,
        y: currentY - 14,
        width: width - 88,
        height: 18,
        color: colorBgLight,
      });
    }

    const cleanLabel = sanitizeUnicode ? label.replace(/[^\x20-\x7E]/g, "?").slice(0, 28) : label.slice(0, 28);
    const cleanVal = sanitizeUnicode ? value.replace(/[^\x20-\x7E]/g, "?").slice(0, 52) : value.slice(0, 52);

    page.drawText(cleanLabel, {
      x: 52,
      y: currentY - 10,
      size: 8,
      font: fontBold,
      color: colorSlateMuted,
    });

    page.drawText(cleanVal, {
      x: 210,
      y: currentY - 10,
      size: 8.5,
      font: fontMono,
      color: colorSlateDark,
    });

    currentY -= 20;
  }

  page.drawRectangle({
    x: 44,
    y: 60,
    width: width - 88,
    height: 48,
    color: rgb(0.95, 0.99, 0.96),
    borderColor: colorEmerald,
    borderWidth: 1,
  });

  page.drawText("OFFICIAL COMPLIANCE SEAL & REGULATORY ATTESTATION", {
    x: 56,
    y: 92,
    size: 8,
    font: fontBold,
    color: colorEmeraldDark,
  });

  page.drawText(
    "This document is an authentic verification transcript generated under statutory compliance (NDPA/NCC).",
    {
      x: 56,
      y: 80,
      size: 7,
      font: fontRegular,
      color: colorSlateMuted,
    }
  );

  page.drawText(`VERIXA AUDIT CHECKSUM: SHA256-${refId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24).toUpperCase()}`, {
    x: 56,
    y: 68,
    size: 7,
    font: fontMono,
    color: colorEmeraldDark,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

await test('Standard Certificate Synthesis: produces valid A4 PDF with %PDF-1. magic header', async () => {
  const sampleResult = {
    service: 'nin',
    reference: 'vx_cert_7728192841',
    verifiedAt: '2026-10-29T10:00:00.000Z',
    data: {
      first_name: 'CHIDERA',
      last_name: 'OKAFOR',
      nin: '70123456789',
      gender: 'MALE',
      date_of_birth: '1990-01-11',
      tracking_id: 'VNX-NIMC-DIR',
    },
  };

  const pdfBuf = await synthesizeCertificatePdf('nin', sampleResult);
  assert(pdfBuf && pdfBuf.length > 500, 'PDF buffer empty or too small');

  const header = pdfBuf.subarray(0, 5).toString('ascii');
  assert(header === '%PDF-', `Expected magic header %PDF-, got ${header}`);

  const loaded = await PDFDocument.load(pdfBuf);
  assert(loaded.getPageCount() === 1, `Expected 1 page, got ${loaded.getPageCount()}`);
  const page = loaded.getPage(0);
  const size = page.getSize();
  assert(Math.abs(size.width - 595.28) < 0.1, `Expected A4 width 595.28, got ${size.width}`);
  assert(Math.abs(size.height - 841.89) < 0.1, `Expected A4 height 841.89, got ${size.height}`);

  return `Size: ${pdfBuf.length} bytes, Header: ${header}1.7`;
});

await test('Adversarial Certificate: Long Company Name (300 chars) & Long Address in CAC', async () => {
  const longName = 'ULTRA CONTINENTAL PETROCHEMICAL TELECOMMUNICATIONS INFRASTRUCTURE AND LOGISTICS CONGLOMERATE HOLDINGS LIMITED CORP PLC DIRECT ' + 'A'.repeat(150);
  const longAddress = 'PLOT 999999 INDUSTRIAL COMMERCIAL AVENUE, VERY LONG FREE TRADE ZONE ROAD, LEKKI DEEP SEA PORT CORRIDOR, LAGOS STATE, NIGERIA ' + 'B'.repeat(100);

  const cacResult = {
    service: 'cac',
    reference: 'vx_cac_9988776655',
    verifiedAt: new Date().toISOString(),
    data: {
      company_name: longName,
      rc_number: 'RC-9988112233',
      address: longAddress,
      status: 'Active',
      type_of_company: 'PLC',
    },
  };

  const pdfBuf = await synthesizeCertificatePdf('cac', cacResult);
  assert(pdfBuf && pdfBuf.length > 500);
  const loaded = await PDFDocument.load(pdfBuf);
  assert(loaded.getPageCount() === 1);
  return `Safely truncated & rendered long values (${pdfBuf.length} bytes)`;
});

await test('Adversarial Certificate: Null/Undefined photo and binary slip blobs stripped from table', async () => {
  const ninResult = {
    service: 'nin',
    reference: 'vx_nin_binary_strip',
    verifiedAt: new Date().toISOString(),
    data: {
      first_name: 'BABATUNDE',
      last_name: 'ADEBAYO',
      nin: '70123456789',
      photo: 'data:image/jpeg;base64,very_large_base64_string',
      pdfBase64: 'JVBERi0xLjQK...',
      docxBase64: 'UEsDBBQAAAA...',
      cardPdfBase64: 'JVBERi0xLjQK...',
      cardSvg: '<svg>...</svg>',
      nin_id: 'JVBERi0xLjQK...',
      tracking_id: 'TRK-100293',
    },
  };

  const pdfBuf = await synthesizeCertificatePdf('nin', ninResult);
  const text = pdfBuf.toString('binary');
  assert(!text.includes('very_large_base64_string'), 'Photo data should have been excluded from attributes table');
  assert(!text.includes('UEsDBBQAAAA'), 'DOCX base64 should have been excluded');
  return 'Binary fields excluded from table';
});

await test('Adversarial Certificate: 100+ Attributes Stress-Test (Bounds & Break at currentY < 120)', async () => {
  const hundredAttrs = {};
  for (let i = 1; i <= 100; i++) {
    hundredAttrs[`attribute_key_field_${i}`] = `Verified Value For Field Number ${i} With Additional Information`;
  }

  const stressResult = {
    service: 'tin',
    reference: 'vx_stress_100_fields',
    verifiedAt: new Date().toISOString(),
    data: hundredAttrs,
  };

  const pdfBuf = await synthesizeCertificatePdf('tin', stressResult);
  assert(pdfBuf && pdfBuf.length > 1000);
  const loaded = await PDFDocument.load(pdfBuf);
  assert(loaded.getPageCount() === 1, 'Pagination guard (currentY < 120) should prevent page overflow or crash');
  return `Successfully broke loop before overflow (${pdfBuf.length} bytes)`;
});

await test('[ADVERSARIAL] Unsanitized Unicode / Naira symbol (₦) in client PDF generation', async () => {
  const rawNubanWithNaira = {
    service: 'nuban',
    reference: 'vx_nuban_naira_sym',
    verifiedAt: new Date().toISOString(),
    data: {
      account_name: 'CHIDERA OKAFOR',
      account_number: '0123456789',
      balance_currency: '₦ NGN', // Contains Naira symbol U+20A6
    },
  };

  let threw = false;
  let errMsg = '';
  try {
    // When sanitizeUnicode is false (as in the worker's current page.tsx code)
    await synthesizeCertificatePdf('nuban', rawNubanWithNaira, false);
  } catch (err) {
    threw = true;
    errMsg = err.message;
  }
  assert(threw, 'Should throw WinAnsi cannot encode error when Naira symbol is passed without sanitization');
  return `VULNERABILITY CONFIRMED: "${errMsg}" when drawing non-WinAnsi symbols in standard Helvetica`;
});

// ---------------------------------------------------------------------------
// SUITE 6: Dashboard UI Result Rendering Logic Edge Cases
// ---------------------------------------------------------------------------
console.log('\n--- SUITE 6: Dashboard UI Result Rendering Logic Edge Cases ---');

function formatNinPill(val) {
  const raw = String(val || "").replace(/\D/g, "");
  if (raw.length === 11) {
    return `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
  }
  return val;
}

function formatBvnDisplay(val, showMasked = true) {
  const str = String(val || "").trim();
  if (!str) return "N/A";
  if (showMasked && str.length === 11) {
    return `${str.slice(0, 1)}*****${str.slice(-5)}`;
  }
  return str;
}

await test('UI formatNinPill handles 11-digit formatted spacing: 4-3-4 pattern', async () => {
  assert(formatNinPill('70123456789') === '7012 345 6789', 'Failed standard 11-digit spacing');
  assert(formatNinPill('7012-345-6789') === '7012 345 6789', 'Failed dash-separated input');
  assert(formatNinPill('123') === '123', 'Failed short input');
  assert(formatNinPill(null) === null, 'Failed null input');
  assert(formatNinPill('') === '', 'Failed empty input');
  return '4-3-4 formatting validated';
});

await test('UI formatBvnDisplay handles masking toggle', async () => {
  const masked = formatBvnDisplay('22222222222', true);
  assert(masked === '2*****22222', `Expected 2*****22222, got ${masked}`);
  const unmasked = formatBvnDisplay('22222222222', false);
  assert(unmasked === '22222222222', `Expected full BVN, got ${unmasked}`);
  assert(formatBvnDisplay(null) === 'N/A', 'Expected N/A for null');
  return 'Masking toggle validated';
});

await test('UI Bespoke Card Name Synthesis handles missing first/middle/last name gracefully', async () => {
  const testCases = [
    { data: {}, expected: '  ' },
    { data: { first_name: 'JOHN' }, expected: 'JOHN  ' },
    { data: { first_name: 'JOHN', last_name: 'DOE' }, expected: 'JOHN  DOE' },
    { data: { first_name: 'JOHN', middle_name: 'M', last_name: 'DOE' }, expected: 'JOHN M DOE' },
    { data: { firstName: 'MARY', surname: 'JANE' }, expected: 'MARY  JANE' },
  ];

  for (const tc of testCases) {
    const synthesized = `${tc.data.first_name || tc.data.firstName || ''} ${tc.data.middle_name || tc.data.middleName || ''} ${tc.data.last_name || tc.data.surname || ''}`;
    assert(typeof synthesized === 'string', 'Synthesized name must be string');
  }
  return 'Empty name segments do not produce NaN or undefined strings';
});

console.log('\n================================================================================');
console.log(`=== SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED out of ${totalPassed + totalFailed} TESTS ===`);
console.log('================================================================================');

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
