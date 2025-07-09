"use server";

import { signIn } from "@/lib/auth/auth";

type OAuthProvider = "google" | "github";

export async function oAuthSignIn(
  provider: OAuthProvider,
  callbackUrl: string
) {
  try {
    await signIn(provider, { redirectTo: callbackUrl, redirect: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      // This is an expected error when redirecting, so we can ignore it.
      return;
    }
    // Log other errors or handle them as needed
    console.error("OAuth sign-in error:", error);
    throw error;
  }
}
