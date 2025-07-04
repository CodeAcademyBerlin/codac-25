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

    // Show loading while checking authentication status
    if (status === "loading") {
      return (
        <div className="flex justify-center items-center py-8">
          <Icons.spinner className="h-6 w-6 animate-spin" />
        </div>
      )
    }
  } catch {
    setError("An error occurred during sign in.");
  } finally {
    setIsCredentialsLoading(false);
  }
};

const isAnyLoading = isCredentialsLoading || isGoogleLoading || isMagicLinkLoading

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
                        disabled={isCredentialsLoading}
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
                        disabled={isCredentialsLoading}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isCredentialsLoading}>
                    {isCredentialsLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                </Button>
            </form>

            <div className="text-center text-sm">
                <span className="text-muted-foreground">Don&apos;t have an account? </span>
                <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => router.push(`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
                >
                    Sign up here
                </Button>
            </div>
        </div >
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-card px-2 text-muted-foreground">
      Or continue with
    </span>
  </div>
      </div >

  { error && (
    <Alert variant="destructive">
      <AlertDescription>{getErrorMessage(error)}</AlertDescription>
    </Alert>
  )}

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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isCredentialsLoading && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Sign In
        </Button>
      </form>

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
          disabled={isLoading}
        >
          Sign up here
        </Button>
      </div>
    </div >
  );
}
