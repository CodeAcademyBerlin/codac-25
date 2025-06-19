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
  return doc;
})