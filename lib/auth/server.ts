import { headers } from "next/headers";
import { auth } from "./index";

/**
 * Get the authenticated session from the server with proper headers handling
 * Use this in server components and API routes to get the current user session
 */
export async function getServerSession() {
  // In Next.js App Router, we need to pass headers() directly
  // Better Auth's nextCookies plugin will handle this correctly
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  // Better Auth returns { session: { ... }, user: { ... } }
  if (!result || !result.session || !result.user) {
    return null;
  }
  // Return the complete result which includes both session and user
  return result as { session: { id: string;[key: string]: any }; user: { id: string; email: string; name: string; image?: string | null } };
}
