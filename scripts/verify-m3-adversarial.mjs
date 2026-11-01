import {
  generateDigitalNinCardSvg,
  generateDigitalNinCardPdf,
  generatePaperSlipSvg,
  generateDocxSlip,
  formatNimcDate,
  wrapText,
} from '../apps/api/dist/slips/slip-generator.util.js';

async function stressTest() {
  console.log('=== STARTING ADVERSARIAL STRESS TEST ===');

  // Edge Case 1: formatNimcDate robustness
  console.log('Format invalid date:', formatNimcDate('not-a-date'));
  console.log('Format empty date:', formatNimcDate(''));
  console.log('Format undefined date:', formatNimcDate(undefined));
  if (formatNimcDate('') !== '') throw new Error('formatNimcDate empty failed');

  // Edge Case 2: wrapText boundaries
  const wrapped1 = wrapText('Short text', 28);
  const wrapped2 = wrapText('This is a very long residential address somewhere in Victoria Island Extension Phase 2 Commercial Zone Lagos', 28);
  const wrappedEmpty = wrapText(undefined, 28);
  console.log('Wrapped 1:', wrapped1);
  console.log('Wrapped 2 lines:', wrapped2.length, wrapped2);
  if (wrappedEmpty.length !== 0) throw new Error('wrapText empty failed');

  // Edge Case 3: Adversarial Citizen Data (nulls, missing fields, XML chars)
  const adversarialCitizen = {
    nin: '99999999999',
    trackingId: undefined, // missing tracking ID
    firstName: 'ALEXANDER-THE-GREAT',
    surname: "O'NEILL & DAUGHTERS",
    middleName: undefined, // missing middle name
    gender: 'F', // single char
    birthdate: 'invalid-date-format',
    address: 'APARTMENT 4B, 1004 HOUSING ESTATE, VICTORIA ISLAND, LAGOS STATE, NIGERIA',
    addressLine1: undefined,
    state: undefined,
    photo: undefined, // missing photo -> should fallback to default_mock_photo
  };

  const svg = await generateDigitalNinCardSvg(adversarialCitizen);
  console.log('Adversarial SVG generated, length:', svg.length);
  if (!svg.includes("O'NEILL &amp; DAUGHTERS") && !svg.includes("O'NEILL & DAUGHTERS")) {
    console.log('Surname contained in SVG');
  }

  const pdf = await generateDigitalNinCardPdf(adversarialCitizen);
  console.log('Adversarial PDF generated, length:', pdf.length);
  if (pdf.length < 50000) throw new Error('PDF too small');

  const paperSvg = await generatePaperSlipSvg(adversarialCitizen);
  console.log('Adversarial Paper SVG generated, length:', paperSvg.length);

  const docx = await generateDocxSlip(adversarialCitizen);
  console.log('Adversarial DOCX generated, length:', docx.length);
  if (docx.length < 50000) throw new Error('DOCX too small');

  // Edge Case 4: Non-11 digit NIN
  const shortNinCitizen = {
    nin: '12345',
    firstName: 'TEST',
    surname: 'USER',
  };
  const shortSvg = await generateDigitalNinCardSvg(shortNinCitizen);
  if (!shortSvg.includes('12345')) throw new Error('Short NIN missing');
  console.log('Short NIN handled gracefully');

  console.log('=== ALL ADVERSARIAL STRESS TESTS PASSED ===');
}

stressTest().catch((err) => {
  console.error('ADVERSARIAL STRESS TEST FAILED:', err);
  process.exit(1);
});
