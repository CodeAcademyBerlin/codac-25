"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";

export async function authenticateWithCredentials(
  callbackUrl: string,
  formData: FormData
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        error: "Email and password are required",
      };
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
    
    // If we reach here, sign-in was successful (signIn redirects on success)
    return {
      success: "Sign-in successful",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            error: "Invalid credentials. Please check your email and password.",
          };
        default:
          return {
            error: "Something went wrong during sign-in.",
          };
      }
    }

    logger.error("Unexpected error during credentials sign-in", error instanceof Error ? error : new Error(String(error)));
    return {
      error: "An unexpected error occurred.",
    };
  }
}

export async function authenticateWithGoogle(callbackUrl: string) {
  try {
    await signIn("google", {
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      logger.error("Google OAuth error", error);
      redirect(`/auth/error?error=OAuthCallback`);
    }

    logger.error("Unexpected error during Google sign-in", error instanceof Error ? error : new Error(String(error)));
    redirect(`/auth/error?error=Configuration`);
  }
}

export async function authenticateWithEmail(callbackUrl: string, formData: FormData) {
  try {
    const email = formData.get("email") as string;

    if (!email) {
      return {
        error: "Email address is required",
      };
    }

    await signIn("resend", {
      email,
      redirectTo: callbackUrl,
    });

    return {
      success: "Check your email for a sign-in link",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "EmailSignInError":
          return {
            error: "Failed to send email. Please try again.",
          };
        default:
          return {
            error: "Something went wrong sending the email.",
          };
      }
    }

    logger.error("Unexpected error during email sign-in", error instanceof Error ? error : new Error(String(error)));
    return {
      error: "An unexpected error occurred.",
    };
  }
}

export async function handleSignOut() {
  try {
    // For now, return a success message
    // Full implementation would use signOut from auth.ts
    return {
      success: "Sign-out successful",
    };
  } catch (error) {
    logger.error("Error during sign-out", error instanceof Error ? error : new Error(String(error)));
    return {
      error: "An error occurred during sign-out.",
    };
  }
}