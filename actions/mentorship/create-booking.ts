"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/auth/auth-utils";

// Define the input schema for booking validation
const bookingSchema = z.object({
  mentorId: z.string().min(1, "Mentor ID is required"),
  scheduledFor: z
    .date()
    .refine(
      (date) => date > new Date(),
      "Session must be scheduled in the future"
    ),
  message: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof bookingSchema>;

// Define return type
export interface CreateBookingResult {
  success: boolean;
  data?: {
    id: string;
    mentorId: string;
    menteeId: string;
    scheduledFor: Date;
  };
  error?: string;
}

export async function createMentorshipBooking(
  data: CreateBookingInput
): Promise<CreateBookingResult> {
  const startTime = Date.now();

  try {
    // Get the current user (mentee)
    const user = await requireAuth();

    logger.logServerAction("create", "booking", {
      metadata: {
        mentorId: data.mentorId,
        scheduledFor: data.scheduledFor,
      },
    });

    // Validate input data
    const validatedData = bookingSchema.parse(data);

    // Add the Mentorship model to the database if it doesn't exist already
    const mentorship = await prisma.mentorship.upsert({
      where: {
        mentorId_menteeId: {
          mentorId: validatedData.mentorId,
          menteeId: user.id,
        },
      },
      update: {}, // No updates needed
      create: {
        mentorId: validatedData.mentorId,
        menteeId: user.id,
        status: "PENDING",
        message: validatedData.message || "Booking request sent",
      },
    });

    // Create booking
    const booking = await prisma.mentorSession.create({
      data: {
        mentorshipId: mentorship.id,
        scheduledFor: validatedData.scheduledFor,
        status: "PENDING",
        notes: validatedData.message,
      },
    });

    logger.logDatabaseOperation("create", "booking", booking.id, {
      metadata: {
        mentorshipId: mentorship.id,
        scheduledFor: booking.scheduledFor,
      },
    });

    logger.info("Booking created successfully", {
      action: "create",
      resource: "booking",
      resourceId: booking.id,
      metadata: {
        duration: Date.now() - startTime,
        mentorshipId: mentorship.id,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/mentorship/find");
    revalidatePath("/mentorship/my-mentors");

    return {
      success: true,
      data: {
        id: booking.id,
        mentorId: mentorship.mentorId,
        menteeId: mentorship.menteeId,
        scheduledFor: booking.scheduledFor,
      },
    };
  } catch (error) {
    logger.logServerActionError(
      "create",
      "booking",
      error instanceof Error ? error : new Error(String(error)),
      {
        metadata: {
          duration: Date.now() - startTime,
          mentorId: data.mentorId,
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
      error: "Failed to book mentorship session",
    };
  }
}
