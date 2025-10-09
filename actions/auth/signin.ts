"use server";

import { signIn, signOut } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { z } from "zod";

// Schema for credentials sign-in
const credentialsSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

// Schema for magic link sign-in
const magicLinkSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export type SignInResult = {
    success: boolean;
    error?: string;
    redirectUrl?: string;
};

/**
 * Sign in with email and password (credentials)
 */
export async function signInWithCredentials(
    formData: FormData
): Promise<SignInResult> {
    try {
        const rawData = {
            email: formData.get("email"),
            password: formData.get("password"),
        };

        logger.info("Credentials sign-in attempt", {
            metadata: { email: rawData.email },
        });

        const { email, password } = credentialsSchema.parse(rawData);

        const callbackUrl = (formData.get("callbackUrl") as string) || "/";

        await signIn("credentials", {
            email,
            password,
            redirectTo: callbackUrl,
        });

        logger.info("Credentials sign-in successful", {
            metadata: { email },
        });

        return {
            success: true,
            redirectUrl: callbackUrl,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            "Credentials sign-in failed",
            error instanceof Error ? error : new Error(String(error)),
            {
                metadata: { email: formData.get("email"), errorMessage },
            }
        );

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Sign in with magic link (email)
 */
export async function signInWithMagicLink(
    formData: FormData
): Promise<SignInResult> {
    try {
        const rawData = {
            email: formData.get("email"),
        };

        logger.info("Magic link sign-in attempt", {
            metadata: { email: rawData.email },
        });

        const { email } = magicLinkSchema.parse(rawData);

        const callbackUrl = (formData.get("callbackUrl") as string) || "/";

        await signIn("resend", {
            email,
            redirectTo: callbackUrl,
        });

        logger.info("Magic link sent successfully", {
            metadata: { email },
        });

        return {
            success: true,
            redirectUrl: "/auth/verify-request",
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            "Magic link sign-in failed",
            error instanceof Error ? error : new Error(String(error)),
            {
                metadata: { email: formData.get("email"), errorMessage },
            }
        );

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Sign in with OAuth provider (Google, GitHub)
 */
export async function signInWithOAuth(
    provider: "google" | "github",
    callbackUrl?: string
): Promise<void> {
    try {
        logger.info("OAuth sign-in attempt", {
            metadata: { provider },
        });

        await signIn(provider, {
            redirectTo: callbackUrl || "/",
        });
    } catch (error) {
        logger.error(
            "OAuth sign-in failed",
            error instanceof Error ? error : new Error(String(error)),
            {
                metadata: { provider },
            }
        );
        throw error;
    }
}

/**
 * Sign out the current user
 */
export async function signOutAction(callbackUrl?: string): Promise<void> {
    try {
        logger.info("Sign-out attempt");

        await signOut({
            redirectTo: callbackUrl || "/auth/signin",
        });

        logger.info("Sign-out successful");
    } catch (error) {
        logger.error(
            "Sign-out failed",
            error instanceof Error ? error : new Error(String(error))
        );
        throw error;
    }
}
