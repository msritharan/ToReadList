const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
    require.resolve('sharp');
} catch (e) {
    console.log('Installing sharp locally...');
    execSync('npm install --no-save sharp', { stdio: 'inherit' });
}

const sharp = require('sharp');

async function processIcons() {
    const svgPath = path.join(__dirname, '../public/icon.svg');
    if (!fs.existsSync(svgPath)) {
        console.error('SVG not found at', svgPath);
        return;
    }

    await sharp(svgPath)
        .resize(192, 192)
        .png()
        .toFile(path.join(__dirname, '../public/icons/icon-192.png'));

    await sharp(svgPath)
        .resize(512, 512)
        .png()
        .toFile(path.join(__dirname, '../public/icons/icon-512.png'));

    console.log('Icons generated successfully');
}

processIcons().catch(console.error);
