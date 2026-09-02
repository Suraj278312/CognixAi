const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processLogo() {
  const inputPath = path.join(__dirname, '..', 'Cognix Ai Logo.png');
  const publicDir = path.join(__dirname, '..', 'public');
  const imagesDir = path.join(publicDir, 'images');
  const appDir = path.join(__dirname, '..', 'src', 'app');

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  console.log('Reading:', inputPath);
  const metadata = await sharp(inputPath).metadata();
  const width = metadata.width;
  const height = metadata.height;
  console.log(`Original Dimensions: ${width}x${height}`);

  // 1. Raw image buffer
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;

  // 2. Create Transparent Light Mode Version
  const lightTransparentBuffer = Buffer.from(data);
  for (let i = 0; i < lightTransparentBuffer.length; i += channels) {
    const r = lightTransparentBuffer[i];
    const g = lightTransparentBuffer[i + 1];
    const b = lightTransparentBuffer[i + 2];

    const brightness = (r + g + b) / 3;
    if (brightness > 245) {
      lightTransparentBuffer[i + 3] = 0;
    } else if (brightness > 215) {
      const alpha = Math.round(((255 - brightness) / 40) * 255);
      lightTransparentBuffer[i + 3] = Math.min(255, Math.max(0, alpha));
    }
  }

  // Tightly trim transparent edges for Light Mode
  const lightPngBuffer = await sharp(lightTransparentBuffer, {
    raw: { width, height, channels },
  })
    .trim()
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(imagesDir, 'cognix-logo.png'), lightPngBuffer);
  fs.writeFileSync(path.join(publicDir, 'cognix-logo.png'), lightPngBuffer);
  console.log('Saved: cognix-logo.png (trimmed)');

  // 3. Create Dark Mode Version (White wordmark + Original gradient symbol)
  const darkTransparentBuffer = Buffer.from(data);
  for (let i = 0; i < darkTransparentBuffer.length; i += channels) {
    const r = darkTransparentBuffer[i];
    const g = darkTransparentBuffer[i + 1];
    const b = darkTransparentBuffer[i + 2];
    const brightness = (r + g + b) / 3;

    const pixelIndex = i / channels;
    const x = pixelIndex % width;

    if (brightness > 245) {
      darkTransparentBuffer[i + 3] = 0;
    } else if (brightness > 215) {
      const alpha = Math.round(((255 - brightness) / 40) * 255);
      darkTransparentBuffer[i + 3] = Math.min(255, Math.max(0, alpha));
    } else if (x > width * 0.32) {
      // Invert dark text in wordmark to crisp white for dark mode
      const opacity = Math.min(255, Math.max(0, (255 - brightness) * 1.6));
      darkTransparentBuffer[i] = 250;     // R
      darkTransparentBuffer[i + 1] = 250; // G
      darkTransparentBuffer[i + 2] = 255; // B
      darkTransparentBuffer[i + 3] = opacity;
    }
  }

  // Tightly trim transparent edges for Dark Mode
  const darkPngBuffer = await sharp(darkTransparentBuffer, {
    raw: { width, height, channels },
  })
    .trim()
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(imagesDir, 'cognix-logo-dark.png'), darkPngBuffer);
  console.log('Saved: cognix-logo-dark.png (trimmed)');

  // 4. Crop Standalone Symbol (left 35% of the logo) tightly trimmed
  const symbolLeft = Math.floor(width * 0.05);
  const symbolTop = Math.floor(height * 0.15);
  const symbolWidth = Math.floor(width * 0.30);
  const symbolHeight = Math.floor(height * 0.70);

  const symbolCrop = await sharp(lightTransparentBuffer, {
    raw: { width, height, channels },
  })
    .extract({
      left: symbolLeft,
      top: symbolTop,
      width: symbolWidth,
      height: symbolHeight,
    })
    .trim()
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(imagesDir, 'cognix-symbol.png'), symbolCrop);
  console.log('Saved: cognix-symbol.png (trimmed)');

  // 5. Generate Favicons
  const favicon32 = await sharp(symbolCrop)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const favicon192 = await sharp(symbolCrop)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon32);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), favicon192);
  fs.writeFileSync(path.join(appDir, 'icon.png'), favicon192);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), favicon192);
  console.log('Saved: favicons and app icons.');

  console.log('All logo assets successfully processed and tightly trimmed!');
}

processLogo().catch(console.error);
