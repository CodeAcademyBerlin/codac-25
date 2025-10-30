"use server";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

const checkAlumniSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export type AlumniCheckResult = {
    isAlumni: boolean;
    message?: string;
    user?: {
        id: string;
        email: string | null;
        name: string | null;
        role: string;
        status: string;
        cohort: {
            name: string;
            slug: string;
        } | null;
    };
};

/**
 * Check if a user is an alumni (pre-registered in the database)
 */
export async function checkAlumniStatus(
    email: string
): Promise<AlumniCheckResult> {
    try {
        const { email: validatedEmail } = checkAlumniSchema.parse({ email });

        logger.info("Checking alumni status", {
            metadata: { email: validatedEmail },
        });

        // Check if user exists in database (pre-registered users)
        const user = await prisma.user.findUnique({
            where: { email: validatedEmail },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                cohort: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        if (user) {
            logger.info("Alumni status verified", {
                metadata: {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    cohort: user.cohort?.name,
                },
            });

            return {
                isAlumni: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    cohort: user.cohort,
                },
            };
        }

        logger.info("User not found in alumni database", {
            metadata: { email: validatedEmail },
        });

        return {
            isAlumni: false,
            message:
                "You are not currently registered as a Code Academy Berlin alumni.",
        };
    } catch (error) {
        logger.error(
            "Failed to check alumni status",
            error instanceof Error ? error : new Error(String(error)),
            {
                metadata: { email },
            }
        );

        throw new Error("Failed to check alumni status. Please try again.");
    }
}
