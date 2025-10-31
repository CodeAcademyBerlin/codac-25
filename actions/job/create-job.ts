"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSession } from '@/lib/auth/session';
import { prisma } from "@/lib/db/prisma";
import { jobSchema } from "@/lib/validation/job";
import { ServerActionResult } from "@/types/server-action";

type FieldErrors = z.ZodFormattedError<z.infer<typeof jobSchema>>;

export async function createJob(
  values: z.infer<typeof jobSchema>
): Promise<ServerActionResult<FieldErrors>> {
  try {
    const session = await getSession();
    if (!session?.session?.user?.id) {
      return { success: false, error: { form: "Unauthorized", _errors: [] } };
    }

    // Fetch user with role information
    const user = await prisma.user.findUnique({
      where: { id: session?.session?.user?.id! },
      select: { id: true, applicationRole: true },
    });

    if (!user || (user.applicationRole !== "ADMIN" && user.applicationRole !== "MENTOR")) {
      return { success: false, error: { form: "Unauthorized", _errors: [] } };
    }

    const validatedFields = jobSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.format(),
      };
    }

    const {
      title,
      description,
      company,
      location,
      type,
      level,
      salary,
      remote,
      applyUrl,
      applyEmail,
    } = validatedFields.data;

    await prisma.job.create({
      data: {
        title,
        description,
        company,
        location: location ?? null,
        type,
        level,
        salary: salary ?? null,
        remote,
        applyUrl: applyUrl || null,
        applyEmail: applyEmail || null,
        postedById: user.id,
      },
    });

    revalidatePath("/career/jobs");
    return { success: true };
  } catch (error) {
    console.error("Error creating job:", error);
    return {
      success: false,
      error: {
        form: "Could not create job post. Please try again later.",
        _errors: [],
      },
    };
  }
}
