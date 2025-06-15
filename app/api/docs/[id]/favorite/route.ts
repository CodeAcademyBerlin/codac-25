import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DEMO_USER_ID = 'demo-user';

// POST /api/documents/[id]/favorite - Toggle favorite status
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_documentId: {
          userId: DEMO_USER_ID,
          documentId: id,
        },
      },
    });

    let isStarred = false;

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      isStarred = false;
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          userId: DEMO_USER_ID,
          documentId: id,
        },
      });
      isStarred = true;
    }

    return NextResponse.json({ isStarred });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}
