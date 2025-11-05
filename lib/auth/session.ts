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
  // Better Auth returns { session: { ... }, user: { ... } }
  if (!result || !result.session || !result.user) {
    return null;
  }
  return result as { session: { id: string; [key: string]: any }; user: { id: string; email: string; name: string; image?: string | null } };
}

