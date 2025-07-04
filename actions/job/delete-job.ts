"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function deleteJob(jobId: string) {
  const session = await auth();
  const user = session?.user;

  if (!user || (user.role !== "ADMIN" && user.role !== "MENTOR")) {
    throw new Error("Unauthorized");
  }

  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { postedById: true },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    if (user.role !== "ADMIN" && job.postedById !== user.id) {
      throw new Error("You do not have permission to delete this job");
    }

    await prisma.job.delete({
      where: { id: jobId },
    });

    revalidatePath("/career/jobs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting job:", error);
    return {
      success: false,
      message:
        (error as Error).message ||
        "Could not delete job post. Please try again later.",
    };
  }
}
