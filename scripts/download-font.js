/**
 * Script to download Inter font TTF for offline use
 * Run: node scripts/download-font.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Try multiple font URLs
const fontUrls = [
  'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.ttf',
  'https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Regular.ttf',
  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/Inter-Regular.ttf',
];
const outputDir = path.join(process.cwd(), 'public', 'fonts');
const outputFile = path.join(outputDir, 'Inter-Regular.ttf');

// Create fonts directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Created fonts directory:', outputDir);
}

console.log('📥 Downloading Inter font...');

let fontUrl = fontUrls[0];
let urlIndex = 0;

function tryDownload() {
  if (urlIndex >= fontUrls.length) {
    console.error('\n❌ All font URLs failed.');
    console.log('\n💡 Please download manually:');
    console.log('   1. Go to: https://fonts.google.com/specimen/Inter');
    console.log('   2. Download Inter-Regular.ttf');
    console.log('   3. Place it in: public/fonts/Inter-Regular.ttf');
    process.exit(1);
  }

  fontUrl = fontUrls[urlIndex];
  console.log(`\nTrying URL ${urlIndex + 1}/${fontUrls.length}: ${fontUrl}`);

  const file = fs.createWriteStream(outputFile);

  https.get(fontUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`❌ Failed (${response.statusCode}), trying next URL...`);
    urlIndex++;
    file.close();
    fs.unlinkSync(outputFile);
    tryDownload();
    return;
  }

  const totalSize = parseInt(response.headers['content-length'], 10);
  let downloadedSize = 0;

  response.on('data', (chunk) => {
    downloadedSize += chunk.length;
    const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
    process.stdout.write(`\r📥 Downloading... ${percent}%`);
  });

  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('\n✅ Font downloaded successfully!');
    console.log('📁 Location:', outputFile);
    console.log('📊 Size:', (downloadedSize / 1024).toFixed(2), 'KB');
    console.log('\n💡 The certificate generator will now use this local font.');
  });
  }).on('error', (err) => {
    console.error(`❌ Error: ${err.message}, trying next URL...`);
    urlIndex++;
    file.close();
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    tryDownload();
  });
}

tryDownload();

