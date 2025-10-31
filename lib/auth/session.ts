import { headers } from "next/headers";
import { auth } from "./index";

/**
 * Get the authenticated session from the server
 * Use this in server actions and API routes to get the current user session
 */
export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  return result as { session: { user: { id: string; email: string; name: string; image?: string | null } } } | null;
}

