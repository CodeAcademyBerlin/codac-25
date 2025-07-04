import { prisma } from "@/lib/db";
import { cache } from 'react'

export async function getDocs(type?: string) {
  const docs = await prisma.document.findMany({
    where: type && type !== 'ALL' ? { type: type as any } : undefined,
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { updatedAt: 'desc' }
    ],
  });
  return docs;
}

export const getDoc = cache(async (id: string) => {
  const doc = await prisma.document.findFirst({
    where: { id },
  });

  if (!doc) return null;

  // Parse the JSON content string into a JavaScript object for PlateJS
  let parsedContent;
  try {
    parsedContent = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;
  } catch (error) {
    console.warn('Failed to parse document content:', error);
    // Fallback to default content if parsing fails
    parsedContent = [
      {
        type: 'p',
        children: [{ text: 'Failed to load document content.' }],
      },
    ];
  }

  return {
    ...doc,
    content: parsedContent,
  };
})