import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';

// POST /api/documents/[id]/favorite - Toggle favorite status
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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
          userId: session.user.id,
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
          userId: session.user.id,
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
