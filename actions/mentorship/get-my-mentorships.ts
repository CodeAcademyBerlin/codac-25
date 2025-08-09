"use server";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/auth/auth-utils";
import { MentorSession, Mentorship } from "@/types/mentorship";

export interface GetMyMentorshipsResult {
  success: boolean;
  data?: {
    activeMentorships: Mentorship[];
    upcomingSessions: MentorSession[];
    pastSessions: MentorSession[];
  };
  error?: string;
}

export async function getMyMentorships(): Promise<GetMyMentorshipsResult> {
  const startTime = Date.now();

  try {
    // Get the current user
    const user = await requireAuth();

    logger.logServerAction("get", "myMentorships", {
      metadata: {
        userId: user.id,
      },
    });

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

    // Get all active mentorships for the user
    const mentorships = await prisma.mentorship.findMany({
      where: {
        menteeId: currentUser.id,
        status: {
          in: ["PENDING", "ACTIVE"],
        },
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            role: true,
            status: true,
            cohort: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                mentorships: true,
                menteeMentorships: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get upcoming sessions across all mentorships - now fully implemented
    const now = new Date();
    const upcomingSessions = await prisma.$queryRaw<Array<any>>`
      SELECT ms.*, m.mentorId, m.menteeId
      FROM mentor_sessions ms
      JOIN mentorships m ON ms.mentorshipId = m.id
      WHERE m.menteeId = ${currentUser.id}
        AND (
          (ms.scheduledFor >= ${now} AND ms.status IN ('PENDING', 'CONFIRMED'))
          OR ms.status = 'DECLINED'
        )
      ORDER BY ms.scheduledFor ASC
    `;

    // Get past sessions
    const pastSessions = await prisma.$queryRaw<Array<any>>`
      SELECT ms.*, m.mentorId, m.menteeId
      FROM mentor_sessions ms
      JOIN mentorships m ON ms.mentorshipId = m.id
      WHERE m.menteeId = ${currentUser.id}
        AND (ms.scheduledFor < ${now} OR ms.status IN ('COMPLETED', 'CANCELLED'))
        AND ms.status != 'DECLINED'
      ORDER BY ms.scheduledFor DESC
      LIMIT 10
    `;

    // Fetch mentors for each session for better UI display
    const mentorsMap = new Map();
    const mentorIds = new Set([
      ...upcomingSessions.map((s: any) => s.mentorId),
      ...pastSessions.map((s: any) => s.mentorId),
    ]);

    if (mentorIds.size > 0) {
      const mentors = await prisma.user.findMany({
        where: {
          id: { in: Array.from(mentorIds) },
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          role: true,
          status: true,
        },
      });

      mentors.forEach((mentor) => {
        mentorsMap.set(mentor.id, mentor);
      });
    }

    // Enhance sessions with mentor data
    const enhancedUpcomingSessions = upcomingSessions.map((session: any) => {
      return {
        ...session,
        mentorship: {
          mentorId: session.mentorId,
          menteeId: session.menteeId,
          mentor: mentorsMap.get(session.mentorId) || null,
        },
      };
    });

    const enhancedPastSessions = pastSessions.map((session: any) => {
      return {
        ...session,
        mentorship: {
          mentorId: session.mentorId,
          menteeId: session.menteeId,
          mentor: mentorsMap.get(session.mentorId) || null,
        },
      };
    });

    logger.info("Mentorships and sessions retrieved successfully", {
      action: "get",
      resource: "myMentorships",
      metadata: {
        duration: Date.now() - startTime,
        mentorshipsCount: mentorships.length,
        upcomingSessionsCount: enhancedUpcomingSessions.length,
        pastSessionsCount: enhancedPastSessions.length,
      },
    });

    // Return with type casting to match our frontend types
    return {
      success: true,
      data: {
        activeMentorships: mentorships as unknown as Mentorship[],
        upcomingSessions:
          enhancedUpcomingSessions as unknown as MentorSession[],
        pastSessions: enhancedPastSessions as unknown as MentorSession[],
      },
    };
  } catch (error) {
    logger.logServerActionError(
      "get",
      "myMentorships",
      error instanceof Error ? error : new Error(String(error)),
      {
        metadata: {
          duration: Date.now() - startTime,
        },
      }
    );

    return {
      success: false,
      error: "Failed to retrieve mentorships",
    };
  }
}
