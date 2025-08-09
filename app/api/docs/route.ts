import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    const documents = await prisma.document.findMany({
      where: {
        parentId: parentId || null,
        authorId: session.user.id,
        isArchived: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, parentId } = body;

    const document = await prisma.document.create({
      data: {
        title: title || 'Untitled',
        content: content || [{ type: 'p', children: [{ text: '' }] }],
        authorId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        favorites: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    const transformedDocument = {
      id: document.id,
      title: document.title,
      content: document.content,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      isStarred: document.favorites.length > 0,
      author: document.author,
    };

    return NextResponse.json({ document: transformedDocument });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
