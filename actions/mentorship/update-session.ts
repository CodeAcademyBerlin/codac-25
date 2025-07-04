"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/auth/auth-utils";

// Define the input schema
const updateSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  status: z
    .enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "DECLINED"])
    .optional(),
  scheduledFor: z.date().optional(),
  feedback: z.string().optional(),
});

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

export interface UpdateSessionResult {
  success: boolean;
  data?: {
    id: string;
    status: string;
    scheduledFor: Date;
    updatedAt: Date;
    mentorId?: string;
    menteeId?: string;
    mentorName?: string | null;
    menteeName?: string | null;
  };
  error?: string;
}

/**
 * Updates a mentor session with new status, scheduled time, or feedback
 *
 * IMPORTANT: When a student reschedules a previously CONFIRMED session,
 * the status is automatically reset to PENDING, requiring the mentor to
 * confirm again. This is determined by checking:
 * 1. If the user is a mentee (not the mentor)
 * 2. If the session was previously confirmed
 * 3. If the scheduled date/time has changed
 */
export async function updateMentorSession(
  data: UpdateSessionInput
): Promise<UpdateSessionResult> {
  const startTime = Date.now();

  try {
    // Get the current user
    const user = await requireAuth();

    logger.logServerAction("update", "mentorSession", {
      resourceId: data.sessionId,
      metadata: {
        userId: user.id,
        status: data.status,
        scheduledFor: data.scheduledFor,
      },
    });

    // Validate input data
    const validatedData = updateSessionSchema.parse(data);

    // Check if the session exists and belongs to the user
    const session = await prisma.mentorSession.findUnique({
      where: { id: validatedData.sessionId },
      include: {
        mentorship: {
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            mentee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return {
        success: false,
        error: "Session not found",
      };
    }

    // Verify ownership (either mentor or mentee can update)
    if (
      session.mentorship.menteeId !== user.id &&
      session.mentorship.mentorId !== user.id
    ) {
      return {
        success: false,
        error: "You do not have permission to update this session",
      };
    }

    // Prepare update data
    const updateData: any = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;
    }

    if (validatedData.scheduledFor) {
      // If the session time is changed and the user is the mentee (not the mentor),
      // and the session was previously confirmed, reset status to PENDING
      if (
        session.mentorship.menteeId === user.id &&
        session.mentorship.mentorId !== user.id &&
        session.status === "CONFIRMED" &&
        validatedData.scheduledFor.getTime() !== session.scheduledFor.getTime()
      ) {
        updateData.status = "PENDING";
        logger.info("Session rescheduled by mentee, status reset to PENDING", {
          resourceId: session.id,
          metadata: {
            oldDate: session.scheduledFor,
            newDate: validatedData.scheduledFor,
          },
        });
      }
      updateData.scheduledFor = validatedData.scheduledFor;
    }

    if (validatedData.feedback) {
      updateData.feedback = validatedData.feedback;
    }

    // Update the session
    const updatedSession = await prisma.mentorSession.update({
      where: { id: validatedData.sessionId },
      data: updateData,
      include: {
        mentorship: {
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
              },
            },
            mentee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    logger.logDatabaseOperation("update", "mentorSession", updatedSession.id, {
      metadata: {
        status: updatedSession.status,
        scheduledFor: updatedSession.scheduledFor,
      },
    });

    logger.info("Session updated successfully", {
      action: "update",
      resource: "mentorSession",
      resourceId: updatedSession.id,
      metadata: {
        duration: Date.now() - startTime,
        status: updatedSession.status,
      },
    });

    // Revalidate all mentorship-related paths to ensure UI updates properly
    revalidatePath("/mentorship/my-mentors");
    revalidatePath("/mentorship/sessions");
    revalidatePath("/mentorship/find");

    return {
      success: true,
      data: {
        id: updatedSession.id,
        status: updatedSession.status,
        scheduledFor: updatedSession.scheduledFor,
        updatedAt: updatedSession.updatedAt,
        mentorId: updatedSession.mentorship.mentorId,
        menteeId: updatedSession.mentorship.menteeId,
        mentorName: updatedSession.mentorship.mentor?.name,
        menteeName: updatedSession.mentorship.mentee?.name,
      },
    };
  } catch (error) {
    logger.logServerActionError(
      "update",
      "mentorSession",
      error instanceof Error ? error : new Error(String(error)),
      {
        metadata: {
          duration: Date.now() - startTime,
          sessionId: data.sessionId,
        },
      }
    );

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(", ");
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: false,
      error: "Failed to update mentorship session",
    };
  }
}
