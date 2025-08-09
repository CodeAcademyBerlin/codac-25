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
    .union([z.date(), z.string()])
    .transform((val) => {
      if (typeof val === "string") {
        const date = new Date(val);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date format");
        }
        return date;
      }
      return val;
    })
    .refine(
      (date) => {
        // Add a 5-minute buffer to account for processing time
        const now = new Date();
        const bufferTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
        return date > bufferTime;
      },
      "Session must be scheduled at least 5 minutes in the future"
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

    console.log("User authenticated:", {
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      userName: user.name,
    });

    console.log("Booking request:", {
      mentorId: data.mentorId,
      scheduledFor: data.scheduledFor,
      message: data.message,
      userId: user.id,
      userRole: user.role,
    });

    logger.logServerAction("create", "booking", {
      metadata: {
        mentorId: data.mentorId,
        scheduledFor: data.scheduledFor,
      },
    });

    console.log("About to validate data...");
    // Validate input data
    const validatedData = bookingSchema.parse(data);
    console.log("Validated data:", validatedData);

    // Verify the current user exists in the database
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!currentUser) {
      console.log("Current user not found in database:", user.id);
      return {
        success: false,
        error: "User session is invalid. Please sign in again.",
      };
    }

    console.log("Current user verified:", currentUser);

    console.log("About to verify mentor...");
    // Verify the mentor exists and is active
    const mentor = await prisma.user.findUnique({
      where: {
        id: validatedData.mentorId,
        role: "MENTOR",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!mentor) {
      console.log("Mentor not found or not active:", validatedData.mentorId);
      return {
        success: false,
        error: "Mentor not found or not available for booking.",
      };
    }

    console.log("Mentor verified:", mentor);
    console.log("About to check existing mentorship...");
    // Check if mentorship already exists
    let mentorship = await prisma.mentorship.findUnique({
      where: {
        mentorId_menteeId: {
          mentorId: validatedData.mentorId,
          menteeId: currentUser.id,
        },
      },
    });

    console.log("Existing mentorship:", mentorship);

    // Use upsert to handle both creation and existing mentorship
    try {
      mentorship = await prisma.mentorship.upsert({
        where: {
          mentorId_menteeId: {
            mentorId: validatedData.mentorId,
            menteeId: currentUser.id,
          },
        },
        update: {
          // Update the message if it's a new booking request
          message: validatedData.message || "Booking request sent",
        },
        create: {
          mentorId: validatedData.mentorId,
          menteeId: currentUser.id,
          status: "PENDING",
          message: validatedData.message || "Booking request sent",
        },
      });
      console.log("Mentorship upserted:", mentorship);
    } catch (upsertError) {
      console.error("Error upserting mentorship:", upsertError);

      // Check if it's a foreign key constraint error
      if (upsertError instanceof Error && upsertError.message.includes("Foreign key constraint")) {
        return {
          success: false,
          error: "Invalid mentor or user. Please try again or contact support.",
        };
      }

      return {
        success: false,
        error: "Failed to create mentorship relationship. Please try again.",
      };
    }

    // Final validation: ensure mentorship is in a valid state
    if (mentorship.status === "COMPLETED" || mentorship.status === "DECLINED") {
      console.log("Mentorship not active for booking:", mentorship.status);
      return {
        success: false,
        error: "This mentorship relationship is no longer active. Please contact support.",
      };
    }

    console.log("About to check for conflicting sessions...");
    // Check for conflicting sessions (within 1 hour of the requested time)
    const oneHourBefore = new Date(validatedData.scheduledFor.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(validatedData.scheduledFor.getTime() + 60 * 60 * 1000);

    const conflictingSession = await prisma.mentorSession.findFirst({
      where: {
        mentorshipId: mentorship.id,
        scheduledFor: {
          gte: oneHourBefore,
          lte: oneHourAfter,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (conflictingSession) {
      console.log("Conflicting session found:", conflictingSession);
      return {
        success: false,
        error: "There is already a session scheduled within 1 hour of your requested time. Please choose a different time.",
      };
    }

    console.log("About to create booking...");
    // Create booking with error handling
    let booking;
    try {
      booking = await prisma.mentorSession.create({
        data: {
          mentorshipId: mentorship.id,
          scheduledFor: validatedData.scheduledFor,
          status: "PENDING",
          notes: validatedData.message,
        },
      });
      console.log("Created booking:", booking);
    } catch (bookingError) {
      console.error("Error creating booking:", bookingError);
      if (bookingError instanceof Error && bookingError.message.includes("Unique constraint")) {
        return {
          success: false,
          error: "A session already exists for this time. Please choose a different time.",
        };
      }
      throw bookingError;
    }

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
    console.error("Booking error details:", {
      error: error,
      errorType: typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      input: data,
    });

    logger.logServerActionError(
      "create",
      "booking",
      error instanceof Error ? error : new Error(String(error)),
      {
        metadata: {
          duration: Date.now() - startTime,
          mentorId: data.mentorId,
          scheduledFor: data.scheduledFor,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
        },
      }
    );

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(", ");
      logger.error("Booking validation failed", {
        errors: error.errors,
        input: data,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes("prisma")) {
      logger.error("Database error during booking creation", {
        errorMessage: error.message,
        input: data,
      });
      return {
        success: false,
        error: "Database error occurred. Please try again.",
      };
    }

    // Handle specific Prisma constraint errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      logger.error("Unique constraint violation during booking creation", {
        errorMessage: error.message,
        input: data,
      });
      return {
        success: false,
        error: "A booking already exists for this time slot. Please choose a different time.",
      };
    }

    // Handle foreign key constraint errors
    if (error instanceof Error && error.message.includes("Foreign key constraint")) {
      logger.error("Foreign key constraint violation during booking creation", {
        errorMessage: error.message,
        input: data,
      });
      return {
        success: false,
        error: "Invalid mentor or user. Please try again.",
      };
    }

    // Handle date parsing errors
    if (error instanceof Error && error.message.includes("Invalid date format")) {
      logger.error("Date parsing error", {
        errorMessage: error.message,
        input: data,
      });
      return {
        success: false,
        error: "Invalid date format. Please try again.",
      };
    }

    return {
      success: false,
      error: "Failed to book mentorship session",
    };
  }
}
