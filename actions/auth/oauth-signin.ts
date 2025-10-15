"use server";

import { signIn } from "@/lib/auth/auth";

type OAuthProvider = "google" | "github";

export async function oAuthSignIn(
  provider: OAuthProvider,
  callbackUrl: string
) {
  try {
    await signIn(provider, { callbackUrl, redirect: true });
  } catch (error) {
    // Next.js throws NEXT_REDIRECT when signIn is successful - this is not an error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("NEXT_REDIRECT")) {
      throw error;
    }
    // Log other errors or handle them as needed
    console.error("OAuth sign-in error:", error);
    throw error;
  }
}
