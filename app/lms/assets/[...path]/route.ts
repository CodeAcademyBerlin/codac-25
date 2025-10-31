import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/lib/auth/session';

const contentAssetsDir = path.join(process.cwd(), 'content/assets');

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        // Check if user is authenticated
        const session = await getSession();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Construct the file path
        const resolvedParams = await params;
        const filePath = path.join(contentAssetsDir, ...resolvedParams.path);

        // Security check: ensure the path is within the assets directory
        const resolvedPath = path.resolve(filePath);
        const resolvedAssetsDir = path.resolve(contentAssetsDir);

        if (!resolvedPath.startsWith(resolvedAssetsDir)) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // Get file stats
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // Read the file
        const fileBuffer = fs.readFileSync(filePath);

        // Determine content type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
            case '.webp':
                contentType = 'image/webp';
                break;
            case '.pdf':
                contentType = 'application/pdf';
                break;
            case '.txt':
                contentType = 'text/plain';
                break;
            case '.md':
                contentType = 'text/markdown';
                break;
        }

        // Return the file with appropriate headers
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
                'Content-Length': stats.size.toString(),
            },
        });
    } catch (error) {
        console.error('Error serving asset:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
