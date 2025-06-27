"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

const CreateDuckSchema = z.object({
  title: z.string().min(1, "Title is required."),
  imageUrl: z.string().url("A valid image URL is required."),
});

export async function createDuck(values: z.infer<typeof CreateDuckSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to create a duck." };
  }
  const userId = session.user.id;

  const validatedFields = CreateDuckSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { title, imageUrl } = validatedFields.data;

  try {
    await prisma.duck.create({
      data: {
        title,
        imageUrl,
        userId,
      },
    });

    revalidatePath("/career/jobs");

    return { success: "Duck created successfully!" };
  } catch (error) {
    console.error("Failed to create duck:", error);
    return { error: "Database Error: Failed to create duck." };
  }
}
