"use server";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/auth/auth-utils";
import { MentorSession } from "@/types/mentorship";

export interface GetMentorSessionsResult {
  success: boolean;
  data?: {
    upcomingSessions: MentorSession[];
    pastSessions: MentorSession[];
    pendingSessionsCount: number;
    completedSessionsCount: number;
    cancelledSessionsCount: number;
    declinedSessionsCount: number;
  };
  error?: string;
}

export async function getMentorSessions(): Promise<GetMentorSessionsResult> {
  const startTime = Date.now();

  try {
    // Get the current user (mentor)
    const user = await requireAuth();

    logger.logServerAction("get", "mentorSessions", {
      metadata: {
        userId: user.id,
      },
    });

    // Get upcoming sessions for the mentor
    const now = new Date();
    const upcomingSessions = await prisma.$queryRaw<Array<any>>`
      SELECT ms.*, m.mentorId, m.menteeId
      FROM mentor_sessions ms
      JOIN mentorships m ON ms.mentorshipId = m.id
      WHERE m.mentorId = ${user.id}
        AND (
          (ms.scheduledFor >= ${now} AND ms.status IN ('PENDING', 'CONFIRMED'))
          OR ms.status = 'DECLINED'
        )
      ORDER BY ms.scheduledFor ASC
    `;

    // Get past sessions for the mentor
    const pastSessions = await prisma.$queryRaw<Array<any>>`
      SELECT ms.*, m.mentorId, m.menteeId
      FROM mentor_sessions ms
      JOIN mentorships m ON ms.mentorshipId = m.id
      WHERE m.mentorId = ${user.id}
        AND ((ms.scheduledFor < ${now} AND ms.status != 'DECLINED') OR ms.status = 'COMPLETED')
      ORDER BY ms.scheduledFor DESC
      LIMIT 20
    `;

    // Get session counts by querying directly
    // Need to use a separate approach to avoid type conflicts
    const counts = await prisma.$queryRaw<
      Array<{ status: string; count: number }>
    >`
      SELECT ms.status, COUNT(*) as count
      FROM mentor_sessions ms
      JOIN mentorships m ON ms.mentorshipId = m.id
      WHERE m.mentorId = ${user.id}
      GROUP BY ms.status
    `;

    // Extract counts from raw query results
    const pendingSessionsCount =
      counts.find((c) => c.status === "PENDING")?.count || 0;
    const completedSessionsCount =
      counts.find((c) => c.status === "COMPLETED")?.count || 0;
    const cancelledSessionsCount =
      counts.find((c) => c.status === "CANCELLED")?.count || 0;
    const declinedSessionsCount =
      counts.find((c) => c.status === "DECLINED")?.count || 0;

    // Fetch mentees for each session for better UI display
    const menteesMap = new Map();
    const menteeIds = new Set([
      ...upcomingSessions.map((s: any) => s.menteeId),
      ...pastSessions.map((s: any) => s.menteeId),
    ]);

    if (menteeIds.size > 0) {
      const mentees = await prisma.user.findMany({
        where: {
          id: { in: Array.from(menteeIds) },
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          cohortId: true,
          cohort: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });

      mentees.forEach((mentee) => {
        menteesMap.set(mentee.id, mentee);
      });
    }

    // Enhance sessions with mentee data
    const enhancedUpcomingSessions = upcomingSessions.map((session: any) => {
      return {
        ...session,
        mentorship: {
          mentorId: session.mentorId,
          menteeId: session.menteeId,
          mentee: menteesMap.get(session.menteeId) || null,
        },
      };
    });

    const enhancedPastSessions = pastSessions.map((session: any) => {
      return {
        ...session,
        mentorship: {
          mentorId: session.mentorId,
          menteeId: session.menteeId,
          mentee: menteesMap.get(session.menteeId) || null,
        },
      };
    });

    logger.info("Mentor sessions retrieved successfully", {
      action: "get",
      resource: "mentorSessions",
      metadata: {
        duration: Date.now() - startTime,
        upcomingSessionsCount: enhancedUpcomingSessions.length,
        pastSessionsCount: enhancedPastSessions.length,
      },
    });

    // Return with type casting to match our frontend types
    return {
      success: true,
      data: {
        upcomingSessions:
          enhancedUpcomingSessions as unknown as MentorSession[],
        pastSessions: enhancedPastSessions as unknown as MentorSession[],
        pendingSessionsCount,
        completedSessionsCount,
        cancelledSessionsCount,
        declinedSessionsCount,
      },
    };
  } catch (error) {
    logger.logServerActionError(
      "get",
      "mentorSessions",
      error instanceof Error ? error : new Error(String(error)),
      {
        metadata: {
          duration: Date.now() - startTime,
        },
      }
    );

    return {
      success: false,
      error: "Failed to retrieve mentor sessions",
    };
  }
}
