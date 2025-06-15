import { prisma } from "@/lib/db";
import { cache } from 'react'

export async function getDocs() {
  const docs = await prisma.document.findMany();
  return docs;
}



export const getDoc = cache(async (id: string) => {
  const doc = await prisma.document.findFirst({
    where: { id },
  });
  return doc;
})