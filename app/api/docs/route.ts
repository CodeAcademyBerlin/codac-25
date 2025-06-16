import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';

// For now, we'll use a hardcoded user ID. In a real app, you'd get this from authentication
const DEMO_USER_ID = 'demo-user';

// Ensure demo user exists
async function ensureDemoUser() {
  const user = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID },
  });

  if (!user) {
    await prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        email: 'demo@example.com',
        name: 'Demo User',
      },
    });
  }
}

// GET /api/documents - Fetch all documents for the user
export async function GET() {
  try {
    await ensureDemoUser();

    const documents = await prisma.document.findMany({
      where: {
        authorId: DEMO_USER_ID,
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
        favorites: {
          where: {
            userId: DEMO_USER_ID,
          },
        },
        children: {
          include: {
            favorites: {
              where: {
                userId: DEMO_USER_ID,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            suggestions: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform the data to match our frontend interface
    const transformedDocuments = documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isStarred: doc.favorites.length > 0,
      author: doc.author,
      commentCount: doc._count.comments,
      suggestionCount: doc._count.suggestions,
      children: doc.children.map((child) => ({
        id: child.id,
        title: child.title,
        content: child.content,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        isStarred: child.favorites.length > 0,
      })),
    }));

    return NextResponse.json({ documents: transformedDocuments });
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
    await ensureDemoUser();

    const body = await request.json();
    const { title, content, parentId } = body;

    const document = await prisma.document.create({
      data: {
        title: title || 'Untitled',
        content: content || [{ type: 'p', children: [{ text: '' }] }],
        authorId: DEMO_USER_ID,
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
            userId: DEMO_USER_ID,
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
