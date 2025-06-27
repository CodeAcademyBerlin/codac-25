"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function deleteDuck(duckId: string) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return { error: "You must be logged in to delete a duck." };
  }

  const duck = await prisma.duck.findUnique({
    where: { id: duckId },
    select: { userId: true },
  });

  if (!duck) {
    return { error: "Duck not found." };
  }

  const canDelete =
    user.role === "ADMIN" || user.role === "MENTOR" || user.id === duck.userId;

  if (!canDelete) {
    return { error: "You are not authorized to delete this duck." };
  }

  try {
    await prisma.duck.delete({
      where: { id: duckId },
    });

    revalidatePath("/career/jobs");
    revalidatePath(`/career/ducks/${duckId}`);

    return { success: "Duck deleted successfully." };
  } catch (error) {
    console.error("Failed to delete duck:", error);
    return { error: "Database Error: Failed to delete duck." };
  }
}
