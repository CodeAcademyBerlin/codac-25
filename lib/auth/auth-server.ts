import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getSession } from "./session";

/**
 * Require authentication on the server and return user with full profile
 * Throws redirect if not authenticated
 */
export async function requireServerAuth() {
  const result = await getSession();

  if (!result?.session?.user?.id) {
    redirect("/sign-in");
  }

  // Fetch full user profile from database
  const user = await prisma.user.findUnique({
    where: { id: result.session.user.id! },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      avatar: true,
      bio: true,
      applicationRole: true,
      status: true,
      cohortId: true,
      githubUrl: true,
      linkedinUrl: true,
      portfolioUrl: true,
      createdAt: true,
      updatedAt: true,
      role: true, // Better Auth role field
      cohort: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

