"use server";

import { Prisma, UserRole, UserStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

// Define mentor type with counts
export type UserWithMentorCounts = {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  cohort: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    mentorships: number;
    menteeMentorships: number;
  };
  // Add optional field for specialty from mentors.json
  specialty?: string;
};

export interface GetMentorsInput {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface GetMentorsResult {
  success: boolean;
  data?: {
    mentors: UserWithMentorCounts[];
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

export async function getMentors(
  data: GetMentorsInput
): Promise<GetMentorsResult> {
  const startTime = Date.now();

  try {
    logger.logServerAction("get", "mentors", {
      metadata: {
        filters: {
          search: data.search,
        },
        pagination: {
          limit: data.limit,
          offset: data.offset,
        },
      },
    });

    // Build where clause for filtering
    const where: Prisma.UserWhereInput = {
      role: "MENTOR",
      status: "ACTIVE",
    };

    if (data.search) {
      where.OR = [
        { name: { contains: data.search } },
        { email: { contains: data.search } },
        { bio: { contains: data.search } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    logger.logDatabaseOperation("count", "mentors", undefined, {
      metadata: { total, filters: where },
    });

    // Get mentors with pagination
    const mentors = await prisma.user.findMany({
      where,
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
      orderBy: {
        name: "asc",
      },
      take: data.limit ?? 20,
      skip: data.offset ?? 0,
    });

    logger.logDatabaseOperation("findMany", "mentors", undefined, {
      metadata: { count: mentors.length, filters: where },
    });

    const hasMore = (data.offset ?? 0) + mentors.length < total;

    logger.info("Mentors retrieved successfully", {
      action: "get",
      resource: "mentors",
      metadata: {
        duration: Date.now() - startTime,
        count: mentors.length,
        total,
        hasMore,
      },
    });

    // Cast mentors to include the optional specialty field
    const mentorsWithSpecialty = mentors as UserWithMentorCounts[];

    return {
      success: true,
      data: {
        mentors: mentorsWithSpecialty,
        total,
        hasMore,
      },
    };
  } catch (error) {
    logger.logServerActionError(
      "get",
      "mentors",
      error instanceof Error ? error : new Error(String(error)),
      {
        metadata: {
          duration: Date.now() - startTime,
        },
      }
    );

    return {
      success: false,
      error: "Failed to retrieve mentors",
    };
  }
}
