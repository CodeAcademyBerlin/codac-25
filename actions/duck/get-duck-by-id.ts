"use server";

import { prisma } from "@/lib/db/prisma";

export async function getDuckById(id: string) {
  try {
    const duck = await prisma.duck.findUnique({
      where: { id },
    });
    return duck;
  } catch (error) {
    console.error(`Failed to get duck with id ${id}:`, error);
    return null;
  }
}
