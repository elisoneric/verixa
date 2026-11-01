import {
  generateDigitalNinCardSvg,
  generateDigitalNinCardPdf,
  generatePaperSlipSvg,
  generateDocxSlip,
  formatNimcDate,
} from '../apps/api/dist/slips/slip-generator.util.js';

async function forensicTest() {
  console.log('=== STARTING FORENSIC EMPIRICAL VERIFICATION ===');

  // Test 1: NIMC Date formatting
  const d1 = formatNimcDate('1990-01-11');
  const d2 = formatNimcDate('1985-12-25');
  console.log('Date 1 formatted:', d1);
  console.log('Date 2 formatted:', d2);
  if (d1 !== '11  JAN  1990') throw new Error('d1 mismatch');
  if (d2 !== '25  DEC  1985') throw new Error('d2 mismatch');

  // Test 2: Dynamic SVG Generation & Content Verification
  const citizenA = {
    nin: '70123456789',
    trackingId: 'WN7890123',
    firstName: 'JOHN',
    surname: 'MUSA',
    middleName: 'DOE',
    gender: 'MALE',
    birthdate: '1990-01-11',
    address: '12 MARINA ROAD',
    addressLine1: 'LAGOS ISLAND',
    state: 'LAGOS',
  };

  const citizenB = {
    nin: '11234567890',
    trackingId: 'WN1234567',
    firstName: 'FATIMA',
    surname: 'BELLO',
    middleName: 'AISHA',
    gender: 'FEMALE',
    birthdate: '1995-07-22',
    address: '44 AHMADU BELLO WAY',
    addressLine1: 'KADUNA NORTH',
    state: 'KADUNA',
  };

  const svgA = await generateDigitalNinCardSvg(citizenA);
  const svgB = await generateDigitalNinCardSvg(citizenB);

  console.log('svgA length:', svgA.length);
  console.log('svgB length:', svgB.length);

  // Verify dynamic content (not identical)
  if (svgA === svgB) throw new Error('SVGs are identical! Hardcoded dummy output detected!');
  if (!svgA.includes('MUSA') || !svgA.includes('7012   345   6789')) throw new Error('svgA missing citizenA specific data');
  if (!svgB.includes('BELLO') || !svgB.includes('1123   456   7890')) throw new Error('svgB missing citizenB specific data');
  if (!svgA.includes('id="guillochePattern"')) throw new Error('Missing guillochePattern');
  if (!svgA.includes('id="coatOfArmsWatermark"')) throw new Error('Missing coatOfArmsWatermark');
  if (!svgA.includes('id="smartChip"')) throw new Error('Missing smartChip');
  if (!svgA.includes('FEDERAL REPUBLIC OF NIGERIA')) throw new Error('Missing microtext');
  console.log('SVG security and dynamic checks: PASSED');

  // Test 3: PDF Card Generation
  const pdfCardA = await generateDigitalNinCardPdf(citizenA);
  const pdfCardB = await generateDigitalNinCardPdf(citizenB);
  console.log('pdfCardA length:', pdfCardA.length);
  console.log('pdfCardB length:', pdfCardB.length);
  if (pdfCardA.length < 50000 || pdfCardB.length < 50000) throw new Error('PDF Card buffer too small');
  if (pdfCardA.equals(pdfCardB)) throw new Error('PDF Cards are identical!');
  console.log('PDF Card dynamic generation checks: PASSED');

  // Test 4: Paper Slip SVG Generation
  const paperSvgA = await generatePaperSlipSvg(citizenA);
  const paperSvgB = await generatePaperSlipSvg(citizenB);
  console.log('paperSvgA length:', paperSvgA.length);
  console.log('paperSvgB length:', paperSvgB.length);
  if (paperSvgA === paperSvgB) throw new Error('Paper slips are identical!');
  if (!paperSvgA.includes('WN7890123') || !paperSvgA.includes('70123456789')) throw new Error('paperSvgA missing tracking/NIN');
  if (!paperSvgB.includes('WN1234567') || !paperSvgB.includes('11234567890')) throw new Error('paperSvgB missing tracking/NIN');
  console.log('Paper Slip SVG dynamic generation checks: PASSED');

  // Test 5: DOCX Generation
  const docxA = await generateDocxSlip(citizenA);
  const docxB = await generateDocxSlip(citizenB);
  console.log('docxA length:', docxA.length);
  console.log('docxB length:', docxB.length);
  if (docxA.length < 50000 || docxB.length < 50000) throw new Error('DOCX buffer too small');
  if (docxA.equals(docxB)) throw new Error('DOCX files are identical!');
  console.log('DOCX generation checks: PASSED');

  console.log('=== ALL FORENSIC CHECKS PASSED EMPIRICALLY ===');
}

forensicTest().catch((err) => {
  console.error('FORENSIC CHECK FAILED:', err);
  process.exit(1);
});
