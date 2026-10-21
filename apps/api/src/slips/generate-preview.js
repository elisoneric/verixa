const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePreview() {
  const bgPath = path.resolve(__dirname, 'assets/image1.jpg');
  const photoPath = path.resolve(__dirname, 'assets/default_mock_photo.jpg');

  const meta = await sharp(bgPath).metadata();
  console.log('Background size:', meta.width, 'x', meta.height);

  // In image1.jpg (1539 x 733):
  // Let's compute exact pixel coordinates matching the EMU ratio in pdf-lib:
  // emuToPt: bgWidth = 7037959 EMU -> 1539 px, so 1 px = 4573.07 EMU
  // photo: X = 5953125 / 4573.07 = 1301.78 px
  // photo Y = 781050 / 4573.07 = 170.79 px
  // photoWidth = 1057021 / 4573.07 = 231.14 px
  // photoHeight = 1369369 / 4573.07 = 299.44 px
  const photoLeft = Math.round(5953125 / 4573.07);
  const photoTop = Math.round(781050 / 4573.07);
  const photoW = Math.round(1057021 / 4573.07);
  const photoH = Math.round(1369369 / 4573.07);

  const resizedPhoto = await sharp(photoPath)
    .resize(photoW, photoH, { fit: 'cover' })
    .toBuffer();

  // Pixel coordinates for text fields:
  // trackid: X = 792785 / 4573.07 = 173 px, Y = 928624 / 4573.07 = 203 px
  // nin: X = 792785 / 4573.07 = 173 px, Y = 1317695 / 4573.07 = 288 px
  // surname: X = 2592865 / 4573.07 = 567 px, Y = 956509 / 4573.07 = 209 px
  // firstname: X = 2592677 / 4573.07 = 567 px, Y = 1314486 / 4573.07 = 287 px
  // middle: X = 2598833 / 4573.07 = 568 px, Y = 1670684 / 4573.07 = 365 px
  // gender: X = 2592865 / 4573.07 = 567 px, Y = 1972564 / 4573.07 = 431 px
  // address: X = 4104725 / 4573.07 = 898 px, Y = 1081024 / 4573.07 = 236 px
  // address1: X = 4104873 / 4573.07 = 898 px, Y = 1881124 / 4573.07 = 411 px
  // state: X = 4104873 / 4573.07 = 898 px, Y = 2025904 / 4573.07 = 443 px

  const svgText = `
    <svg width="${meta.width}" height="${meta.height}">
      <style>
        .bold { font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 19px; fill: #000000; }
        .regular { font-family: Arial, Helvetica, sans-serif; font-weight: normal; font-size: 17px; fill: #000000; }
        .nin { font-family: Arial, Helvetica, sans-serif; font-weight: bold; font-size: 21px; fill: #000000; letter-spacing: 1px; }
      </style>
      <!-- Tracking ID -->
      <text x="173" y="218" class="regular">VNX796745906418</text>
      <!-- NIN -->
      <text x="173" y="303" class="nin">70123456789</text>
      <!-- Surname -->
      <text x="567" y="224" class="bold">DANJUMA</text>
      <!-- Firstname -->
      <text x="567" y="302" class="bold">OLUMIDE</text>
      <!-- Middle name -->
      <text x="567" y="380" class="bold">IFEANYI</text>
      <!-- Gender -->
      <text x="567" y="446" class="bold">M</text>
      <!-- Address -->
      <text x="898" y="251" class="regular">14 ADENIRAN OGUNSANYA STREET</text>
      <!-- Address Line 1 -->
      <text x="898" y="426" class="regular">SURULERE, IKEJA LGA</text>
      <!-- State -->
      <text x="898" y="458" class="regular">LAGOS STATE</text>
    </svg>
  `;

  const outputJpg = await sharp(bgPath)
    .composite([
      { input: resizedPhoto, top: photoTop, left: photoLeft },
      { input: Buffer.from(svgText), top: 0, left: 0 }
    ])
    .jpeg({ quality: 95 })
    .toBuffer();

  const outPath = path.resolve(__dirname, 'assets/filled_mock_nin_slip.jpg');
  fs.writeFileSync(outPath, outputJpg);
  console.log('Saved filled mock nin slip to:', outPath, 'size:', outputJpg.length);

  // Also copy to artifact dir so it can be viewed and embedded in the artifact
  const artifactDir = 'C:/Users/eliso/.gemini/antigravity-ide/brain/e01ef5bf-2771-4bad-8f1f-35842df9841b';
  if (fs.existsSync(artifactDir)) {
    const artifactPath = path.join(artifactDir, 'filled_mock_nin_slip.jpg');
    fs.writeFileSync(artifactPath, outputJpg);
    console.log('Copied to artifact dir:', artifactPath);
  }

  // Also copy to dashboard public dir so it can be previewed in web UI
  const dashboardPublicDir = path.resolve(__dirname, '../../../dashboard/public');
  if (fs.existsSync(dashboardPublicDir)) {
    const publicPath = path.join(dashboardPublicDir, 'filled_mock_nin_slip.jpg');
    fs.writeFileSync(publicPath, outputJpg);
    console.log('Copied to dashboard public:', publicPath);
  }
}

generatePreview().catch(console.error);
