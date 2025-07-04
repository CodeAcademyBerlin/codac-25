/**
 * Script to generate favicons from SVG files
 * Run with: node scripts/generate-favicons.js
 * 
 * Requirements:
 * npm install sharp
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');

async function generateFavicons() {
    try {
        // Try to use sharp (if available)
        const sharp = require('sharp');

        const publicDir = path.join(__dirname, '../public');
        const faviconSvg = path.join(publicDir, 'favicon.svg');
        const appleTouchSvg = path.join(publicDir, 'apple-touch-icon.svg');

        // Generate different favicon sizes
        const sizes = [16, 32, 48, 64, 128];

        console.log('🎨 Generating favicon files...');

        // Generate PNG favicons
        for (const size of sizes) {
            await sharp(faviconSvg)
                .resize(size, size)
                .png()
                .toFile(path.join(publicDir, `favicon-${size}x${size}.png`));

            console.log(`✅ Generated favicon-${size}x${size}.png`);
        }

        // Generate Apple Touch Icon (180x180 PNG)
        await sharp(appleTouchSvg)
            .resize(180, 180)
            .png()
            .toFile(path.join(publicDir, 'apple-touch-icon.png'));

        console.log('✅ Generated apple-touch-icon.png');

        // Generate standard favicon.ico (multi-size)
        await sharp(faviconSvg)
            .resize(32, 32)
            .png()
            .toFile(path.join(publicDir, 'favicon-temp.png'));

        console.log('🎉 Favicon generation complete!');
        console.log('📝 Note: For ICO format, consider using an online converter or imagemagick');
        console.log('   convert favicon-32x32.png favicon.ico');

    } catch (error) {
        console.error('❌ Error generating favicons:', error.message);
        console.log('\n📦 To fix this, install the required dependencies:');
        console.log('   npm install sharp');
        console.log('\n🌐 Alternative: Use online tools like:');
        console.log('   - favicon.io');
        console.log('   - realfavicongenerator.net');
        console.log('   - convertio.co');
    }
}

// Instructions for manual conversion
function showInstructions() {
    console.log('\n📋 Manual Favicon Generation Instructions:');
    console.log('=========================================');
    console.log('1. Open public/favicon.svg in a vector graphics editor');
    console.log('2. Export as PNG at these sizes: 16x16, 32x32, 48x48');
    console.log('3. Use favicon.ico converter online');
    console.log('4. Replace the existing favicon.ico file');
    console.log('\n🍎 For Apple Touch Icon:');
    console.log('1. Open public/apple-touch-icon.svg');
    console.log('2. Export as PNG at 180x180');
    console.log('3. Save as apple-touch-icon.png');
}

generateFavicons().then(() => {
    showInstructions();
}); 