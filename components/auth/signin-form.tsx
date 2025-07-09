"use client";

import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SignInFormProps {
  callbackUrl?: string;
}

function getErrorMessage(error: string | undefined): string {
  switch (error) {
    case "OAuthSignin":
      return "Error in constructing an authorization URL.";
    case "OAuthCallback":
      return "Error in handling the response from an OAuth provider.";
    case "OAuthCreateAccount":
      return "Could not create OAuth account.";
    case "EmailCreateAccount":
      return "Could not create email account.";
    case "Callback":
      return "Error in the OAuth callback handler route.";
    case "OAuthAccountNotLinked":
      return "Email on the account is already linked, but not with this OAuth account.";
    case "EmailSignin":
      return "Check your email address.";
    case "CredentialsSignin":
      return "Sign in failed. Check the details you provided are correct.";
    case "SessionRequired":
      return "Please sign in to access this page.";
    default:
      return "An error occurred during sign in.";
  }
}

export function SignInForm({
  callbackUrl: initialCallbackUrl,
}: SignInFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)

  // Get parameters from URL
  const callbackUrl =
    initialCallbackUrl || searchParams.get("callbackUrl") || "/";
  const urlError = searchParams.get("error");
  const [error, setError] = useState<string | undefined>(urlError || undefined);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  // Update error state when URL error changes
  useEffect(() => {
    if (urlError) {
      setError(urlError);
    }
  }, [urlError]);

  const handleCredentialsSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsCredentialsLoading(true);
    setError(undefined);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch {
      setError("An error occurred during sign in.");
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(undefined);

    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("An error occurred during Google sign in.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleMagicLinkSignIn = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsMagicLinkLoading(true);
    setError(undefined);

    try {
      const result = await signIn("email", {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("An error occurred during magic link sign in.");
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  const isAnyLoading = isCredentialsLoading || isGoogleLoading || isMagicLinkLoading;

  // Show loading while checking authentication status
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center py-8">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {getErrorMessage(error)}
          </AlertDescription>
        </Alert>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isAnyLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isAnyLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isAnyLoading}>
          {isCredentialsLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isAnyLoading}
        >
          {isGoogleLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          <Icons.google className="mr-2 h-4 w-4" />
          Google
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleMagicLinkSignIn}
          disabled={isAnyLoading || !email}
        >
          {isMagicLinkLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          <Icons.email className="mr-2 h-4 w-4" />
          Send Magic Link
        </Button>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Button
          variant="link"
          className="p-0 h-auto font-normal"
          onClick={() =>
            router.push(
              `/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
            )
          }
          disabled={isAnyLoading}
        >
          Sign up here
        </Button>
      </div>
    </div>
  );
}
