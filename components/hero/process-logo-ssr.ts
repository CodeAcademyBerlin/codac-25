import { readFileSync } from 'fs';

import { createCanvas, loadImage } from 'canvas';

/** Server-side version of parseLogoImage that processes the logo at build time */
export async function processLogoSSR(imagePath: string): Promise<{
    imageData: { width: number; height: number; data: number[] };
}> {
    console.log('🎨 Preprocessing logo image...');

    // Read SVG and add explicit dimensions if missing
    let svgContent = readFileSync(imagePath, 'utf-8');

    // Parse viewBox if present and add width/height
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch) {
        const viewBox = viewBoxMatch[1].split(/\s+/).map(Number);
        // viewBox is [minX, minY, width, height] in SVG 1.1 spec
        // But often it's [minX, minY, maxX, maxY], need to check the values
        let width, height;
        if (viewBox[2] > viewBox[0] + 100) {
            // Likely absolute coordinates
            width = viewBox[2] - viewBox[0];
            height = viewBox[3] - viewBox[1];
        } else {
            // Already width/height format
            width = viewBox[2];
            height = viewBox[3];
        }

        // Remove any existing width/height and add new ones
        svgContent = svgContent.replace(/\s+width="[^"]*"/g, '');
        svgContent = svgContent.replace(/\s+height="[^"]*"/g, '');
        svgContent = svgContent.replace('<svg', `<svg width="${width}" height="${height}"`);
        console.log(`📝 Added dimensions: ${width}x${height}`);
    }

    // Create a data URL from the modified SVG
    const svgDataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svgContent).toString('base64');
    const img = await loadImage(svgDataUrl);

    // Force high fidelity for SVG
    let width = img.width || 1000;
    let height = img.height || 1000;

    const MAX_SIZE = 1000;
    const MIN_SIZE = 500;

    // Calculate new dimensions if image is too large or too small
    if (width > MAX_SIZE || height > MAX_SIZE || width < MIN_SIZE || height < MIN_SIZE) {
        if (width > height) {
            if (width > MAX_SIZE) {
                height = Math.round((height * MAX_SIZE) / width);
                width = MAX_SIZE;
            } else if (width < MIN_SIZE) {
                height = Math.round((height * MIN_SIZE) / width);
                width = MIN_SIZE;
            }
        } else {
            if (height > MAX_SIZE) {
                width = Math.round((width * MAX_SIZE) / height);
                height = MAX_SIZE;
            } else if (height < MIN_SIZE) {
                width = Math.round((width * MIN_SIZE) / height);
                height = MIN_SIZE;
            }
        }
    }

    console.log(`📐 Image dimensions: ${width}x${height}`);

    const shapeCanvas = createCanvas(width, height);
    const shapeCtx = shapeCanvas.getContext('2d');
    shapeCtx.drawImage(img, 0, 0, width, height);

    // 1) Build the inside/outside mask
    console.log('🔍 Building shape mask...');
    const shapeImageData = shapeCtx.getImageData(0, 0, width, height);
    const data = shapeImageData.data;
    const shapeMask = new Array(width * height).fill(false);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx4 = (y * width + x) * 4;
            const r = data[idx4];
            const g = data[idx4 + 1];
            const b = data[idx4 + 2];
            const a = data[idx4 + 3];
            if ((r === 255 && g === 255 && b === 255 && a === 255) || a === 0) {
                shapeMask[y * width + x] = false;
            } else {
                shapeMask[y * width + x] = true;
            }
        }
    }

    function inside(x: number, y: number) {
        if (x < 0 || x >= width || y < 0 || y >= height) return false;
        return shapeMask[y * width + x];
    }

    // 2) Identify boundary
    console.log('🎯 Identifying boundaries...');
    const boundaryMask = new Array(width * height).fill(false);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (!shapeMask[idx]) continue;
            let isBoundary = false;
            for (let ny = y - 1; ny <= y + 1 && !isBoundary; ny++) {
                for (let nx = x - 1; nx <= x + 1 && !isBoundary; nx++) {
                    if (!inside(nx, ny)) {
                        isBoundary = true;
                    }
                }
            }
            if (isBoundary) {
                boundaryMask[idx] = true;
            }
        }
    }

    // 3) Poisson solve
    console.log('🔬 Running Poisson solver (300 iterations)...');
    const u = new Float32Array(width * height).fill(0);
    const newU = new Float32Array(width * height).fill(0);
    const C = 0.01;
    const ITERATIONS = 300;

    function getU(x: number, y: number, arr: Float32Array) {
        if (x < 0 || x >= width || y < 0 || y >= height) return 0;
        if (!shapeMask[y * width + x]) return 0;
        return arr[y * width + x];
    }

    for (let iter = 0; iter < ITERATIONS; iter++) {
        if (iter % 50 === 0) {
            console.log(`  Iteration ${iter}/${ITERATIONS}...`);
        }
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                if (!shapeMask[idx] || boundaryMask[idx]) {
                    newU[idx] = 0;
                    continue;
                }
                const sumN = getU(x + 1, y, u) + getU(x - 1, y, u) + getU(x, y + 1, u) + getU(x, y - 1, u);
                newU[idx] = (C + sumN) / 4;
            }
        }
        // Swap u with newU
        for (let i = 0; i < width * height; i++) {
            u[i] = newU[i];
        }
    }

    // 4) Normalize and apply nonlinear remap
    console.log('✨ Normalizing and remapping...');
    let maxVal = 0;
    for (let i = 0; i < width * height; i++) {
        if (u[i] > maxVal) maxVal = u[i];
    }

    const alpha = 2.0;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const outImg = ctx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const px = idx * 4;
            if (!shapeMask[idx]) {
                outImg.data[px] = 255;
                outImg.data[px + 1] = 255;
                outImg.data[px + 2] = 255;
                outImg.data[px + 3] = 255;
            } else {
                const raw = u[idx] / maxVal;
                const remapped = Math.pow(raw, alpha);
                const gray = 255 * (1 - remapped);
                outImg.data[px] = gray;
                outImg.data[px + 1] = gray;
                outImg.data[px + 2] = gray;
                outImg.data[px + 3] = 255;
            }
        }
    }


    // Convert ImageData to a serializable format
    return {
        imageData: {
            width,
            height,
            data: Array.from(outImg.data),
        },
    };
}



