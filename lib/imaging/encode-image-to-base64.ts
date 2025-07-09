import fs from 'fs';
import path from 'path';

/**
 * Reads an image file and converts it to a base64 data URI
 * @param imagePath - Path to the image file
 * @returns Promise<string> - Base64 data URI string
 */
export async function encodeImageToBase64(imagePath: string): Promise<string> {
    try {
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            throw new Error(`Image file not found: ${imagePath}`);
        }

        // Read the file
        const imageBuffer = fs.readFileSync(imagePath);

        // Get file extension to determine MIME type
        const ext = path.extname(imagePath).toLowerCase();
        let mimeType: string;

        switch (ext) {
            case '.jpg':
            case '.jpeg':
                mimeType = 'image/jpeg';
                break;
            case '.png':
                mimeType = 'image/png';
                break;
            case '.gif':
                mimeType = 'image/gif';
                break;
            case '.webp':
                mimeType = 'image/webp';
                break;
            case '.svg':
                mimeType = 'image/svg+xml';
                break;
            default:
                throw new Error(`Unsupported image format: ${ext}`);
        }

        // Convert to base64 data URI
        const base64Data = imageBuffer.toString('base64');
        return `data:${mimeType};base64,${base64Data}`;
    } catch (error) {
        throw new Error(`Failed to encode image to base64: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Encodes an image file from the seed data images folder
 * @param filename - Name of the image file in prisma/seed/data/images/
 * @returns Promise<string> - Base64 data URI string
 */
export async function encodeSeedImageToBase64(filename: string): Promise<string> {
    const imagePath = path.join(process.cwd(), 'prisma/seed/data/images', filename);
    return await encodeImageToBase64(imagePath);
} 