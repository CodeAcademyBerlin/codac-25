import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { InputJsonValue } from '@prisma/client/runtime/library';

const DEMO_USER_ID = 'demo-user';

// GET /api/documents/[id] - Get a specific document
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: {
        id,
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
        comments: {
          include: {
            // user: {
            //   select: {
            //     id: true,
            //     name: true,
            //     email: true,
            //   },
            // },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        suggestions: {
          include: {
            user: {
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
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const transformedDocument = {
      id: document.id,
      title: document.title,
      content: document.content,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      isStarred: document.favorites.length > 0,
      author: document.author,
      comments: document.comments,
      suggestions: document.suggestions,
    };

    return NextResponse.json({ document: transformedDocument });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Update a document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, createVersion = false } = body;

    const currentDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!currentDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Only create version if explicitly requested or if significant time has passed
    if (createVersion) {
      try {
        // Use a transaction to handle race conditions
        await prisma.$transaction(async (tx) => {
          const latestVersion = await tx.documentVersion.findFirst({
            where: { documentId: id },
            orderBy: { version: 'desc' },
          });

          const nextVersion = (latestVersion?.version || 0) + 1;

          // Check if a version was created recently (within last 5 minutes)
          const recentVersion = await tx.documentVersion.findFirst({
            where: {
              documentId: id,
              createdAt: {
                gte: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
              },
            },
          });

          // Only create version if no recent version exists
          if (!recentVersion) {
            await tx.documentVersion.create({
              data: {
                documentId: id,
                content: currentDocument.content as InputJsonValue,
                title: currentDocument.title,
                version: nextVersion,
              },
            });
          }
        });
      } catch (versionError) {
        // Log version creation error but don't fail the update
        console.warn('Version creation failed:', versionError);
      }
    }

    // Prepare update data
    const updateData: {
      title?: string;
      content?: InputJsonValue;
      updatedAt?: Date;
    } = {
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      updateData.title = title as string;
    }

    if (content !== undefined) {
      updateData.content = content as InputJsonValue;
    }

    // Update the document
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: updateData,
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
      id: updatedDocument.id,
      title: updatedDocument.title,
      content: updatedDocument.content,
      createdAt: updatedDocument.createdAt,
      updatedAt: updatedDocument.updatedAt,
      isStarred: updatedDocument.favorites.length > 0,
      author: updatedDocument.author,
    };

    return NextResponse.json({ document: transformedDocument });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete by archiving
    await prisma.document.update({
      where: { id },
      data: {
        isArchived: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
