const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function run() {
  const assetsDir = path.resolve('apps/api/dist/slips/assets');
  const bgPath = path.join(assetsDir, 'image1.jpg');
  const photoPath = path.join(assetsDir, 'default_mock_photo.jpg');
  const templatePath = path.join(assetsDir, 'ninslip.docx');

  const bgBuffer = fs.readFileSync(bgPath);
  const photoBuffer = fs.readFileSync(photoPath);

  const cleanNin = '58209182347';
  const rawTrackingId = 'VNX-7940-2041-8932';
  const cleanTrackingId = rawTrackingId.replace(/[\s-]/g, ''); // e.g. VNX794020418932
  const genderChar = 'M'; // Single character: M or F

  const sampleData = {
    trackingId: cleanTrackingId,
    nin: cleanNin,
    surname: 'ADEBAYO',
    firstName: 'BABATUNDE',
    middleName: 'OLUWASEUN',
    gender: genderChar,
    address: '14 ADENIRAN OGUNSANYA STREET',
    addressLine1: 'SURULERE, IKEJA LGA',
    state: 'LAGOS STATE',
  };

  // 1. DOCX Generation
  const zip = new AdmZip(templatePath);
  let docXml = zip.readAsText('word/document.xml');

  const replacements = {
    '\\[trackid\\]': sampleData.trackingId,
    '\\[nin\\]': cleanNin,
    '\\[surname\\]': sampleData.surname,
    '\\[firstname\\]': sampleData.firstName,
    '\\[middle\\]': sampleData.middleName,
    '\\[gender\\]': genderChar,
    '\\[address\\]': sampleData.address,
    '\\[address1\\]': sampleData.addressLine1,
    '\\[state\\]': sampleData.state,
  };

  for (const [k, v] of Object.entries(replacements)) {
    docXml = docXml.replace(new RegExp(k, 'g'), v);
  }

  docXml = docXml.replace(/\[\s*<\/w:t>.*?<w:t>trackid<\/w:t>.*?<w:t>\s*\]/gs, sampleData.trackingId);
  docXml = docXml.replace(/\[\s*<\/w:t>.*?<w:t>nin<\/w:t>.*?<w:t>\s*\]/gs, cleanNin);
  docXml = docXml.replace(/\[\s*<\/w:t>.*?<w:t>firstname<\/w:t>.*?<w:t>\s*\]/gs, sampleData.firstName);

  zip.updateFile('word/document.xml', Buffer.from(docXml, 'utf-8'));
  zip.updateFile('word/media/image2.png', photoBuffer);
  zip.updateFile('word/media/image10.png', photoBuffer);
  zip.writeZip('sample_nin_slip.docx');
  console.log('sample_nin_slip.docx generated, size:', fs.statSync('sample_nin_slip.docx').size);

  // 2. PDF Generation
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  // Regular weight font (NO BOLD) at 7.5 pt size
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const bgImage = await pdfDoc.embedJpg(bgBuffer);
  const photoImage = await pdfDoc.embedJpg(photoBuffer);

  const emuToPt = (emu) => emu / 12700.0;
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  const bgWidth = emuToPt(7037959);
  const bgHeight = emuToPt(3352800);
  const bgX = (pageWidth - bgWidth) / 2.0;

  const photoWidth = emuToPt(1057021);
  const photoHeight = emuToPt(1369369);
  const photoRelX = emuToPt(5953125);
  const photoRelYFromTop = emuToPt(781050) + photoHeight;

  function renderSlip(topOffset) {
    const slipY = topOffset - bgHeight;
    page.drawImage(bgImage, { x: bgX, y: slipY, width: bgWidth, height: bgHeight });
    page.drawImage(photoImage, { x: bgX + photoRelX, y: topOffset - photoRelYFromTop, width: photoWidth, height: photoHeight });

    const drawField = (text, emuX, emuY) => {
      if (!text) return;
      page.drawText(String(text).toUpperCase(), {
        x: bgX + emuToPt(emuX),
        y: topOffset - emuToPt(emuY) - 7.5,
        size: 7.5,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
    };

    if (sampleData.trackingId) {
      drawField(sampleData.trackingId, 792785, 928624); // no space, no dash
    }
    drawField(cleanNin, 792785, 1317695); // NIN with no space
    drawField(sampleData.surname, 2592865, 956509);
    drawField(sampleData.firstName, 2592677, 1314486);
    drawField(sampleData.middleName, 2598833, 1670684);
    drawField(genderChar, 2592865, 1972564); // M or F
    drawField(sampleData.address, 4104725, 1081024);
    drawField(sampleData.addressLine1, 4104873, 1881124);
    drawField(sampleData.state, 4104873, 2025904);

    return slipY;
  }

  const topSlipY = renderSlip(pageHeight - 25);
  const tearY = topSlipY - 25;
  page.drawLine({ start: { x: bgX, y: tearY }, end: { x: bgX + bgWidth, y: tearY }, thickness: 0.75, color: rgb(0.65, 0.65, 0.65), dashArray: [4, 4] });
  page.drawText('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  TEAR / CUT HERE  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -', {
    x: bgX + 20, y: tearY + 4, size: 7, font: fontRegular, color: rgb(0.5, 0.5, 0.5)
  });
  renderSlip(tearY - 25);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('sample_nin_slip.pdf', pdfBytes);
  console.log('sample_nin_slip.pdf generated, size:', fs.statSync('sample_nin_slip.pdf').size);
}

run().catch(console.error);
