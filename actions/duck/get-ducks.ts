"use server";

import { prisma } from "@/lib/db/prisma";

export async function getDucks() {
  try {
    const ducks = await prisma.duck.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    return ducks;
  } catch (error) {
    console.error("Failed to get ducks:", error);
    return [];
  }
}
