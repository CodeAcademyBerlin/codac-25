"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { jobSchema } from "@/lib/validation/job";
import { ServerActionResult } from "@/types/server-action";

type FieldErrors = z.ZodFormattedError<z.infer<typeof jobSchema>>;

export async function updateJob(
  jobId: string,
  values: z.infer<typeof jobSchema>
): Promise<ServerActionResult<FieldErrors>> {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return { success: false, error: { form: "Unauthorized", _errors: [] } };
    }

    const validatedFields = jobSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.format(),
      };
    }

    const jobToUpdate = await prisma.job.findUnique({
      where: { id: jobId },
      select: { postedById: true },
    });

    if (!jobToUpdate) {
      return { success: false, error: { form: "Job not found", _errors: [] } };
    }

    const canUpdate =
      user.role === "ADMIN" || jobToUpdate.postedById === user.id;

    if (!canUpdate) {
      return {
        success: false,
        error: {
          form: "You do not have permission to edit this job",
          _errors: [],
        },
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

    await prisma.job.update({
      where: { id: jobId },
      data: {
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
      },
    });

    revalidatePath("/career/jobs");
    revalidatePath(`/career/jobs/${jobId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Error updating job:", error);
    return {
      success: false,
      error: {
        form: "Could not update job post. Please try again later.",
        _errors: [],
      },
    };
  }
}
