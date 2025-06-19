"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/ui/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SignInFormProps {
    callbackUrl?: string
}

function getErrorMessage(error: string | undefined): string {
    switch (error) {
        case "OAuthSignin":
            return "Error in constructing an authorization URL."
        case "OAuthCallback":
            return "Error in handling the response from an OAuth provider."
        case "OAuthCreateAccount":
            return "Could not create OAuth account."
        case "EmailCreateAccount":
            return "Could not create email account."
        case "Callback":
            return "Error in the OAuth callback handler route."
        case "OAuthAccountNotLinked":
            return "Email on the account is already linked, but not with this OAuth account."
        case "EmailSignin":
            return "Check your email address."
        case "CredentialsSignin":
            return "Sign in failed. Check the details you provided are correct."
        case "SessionRequired":
            return "Please sign in to access this page."
        default:
            return "An error occurred during sign in."
    }
}

export function SignInForm({ callbackUrl: initialCallbackUrl }: SignInFormProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Form state
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isEmailLoading, setIsEmailLoading] = useState(false)
    const [isCredentialsLoading, setIsCredentialsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    // Get parameters from URL
    const callbackUrl = initialCallbackUrl || searchParams.get('callbackUrl') || "/"
    const urlError = searchParams.get('error')
    const [error, setError] = useState<string | undefined>(urlError || undefined)

    // Redirect if already authenticated
    useEffect(() => {
        if (status === "authenticated" && session) {
            router.replace(callbackUrl)
        }
    }, [session, status, router, callbackUrl])

    // Update error state when URL error changes
    useEffect(() => {
        if (urlError) {
            setError(urlError)
        }
    }, [urlError])

    const handleCredentialsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!email || !password) {
            setError("Email and password are required")
            return
        }

        setIsCredentialsLoading(true)
        setError(undefined)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                callbackUrl,
                redirect: false,
            })

            if (result?.error) {
                setError(result.error)
            } else if (result?.ok) {
                router.push(callbackUrl)
            }
        } catch (err) {
            setError("An error occurred during sign in.")
        } finally {
            setIsCredentialsLoading(false)
        }
    }

    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!email) {
            setError("Email is required")
            return
        }

        setIsEmailLoading(true)
        setError(undefined)

        try {
            const result = await signIn("email", {
                email,
                callbackUrl,
                redirect: false,
            })

            if (result?.error) {
                setError(result.error)
            } else {
                // Redirect to verification page or handle success
                router.push("/auth/verify-request")
            }
        } catch (err) {
            setError("An error occurred during sign in.")
        } finally {
            setIsEmailLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true)
        setError(undefined)

        try {
            const result = await signIn("google", {
                callbackUrl,
                redirect: false,
            })

            if (result?.error) {
                setError(result.error)
            }
        } catch (err) {
            setError("An error occurred during sign in.")
        } finally {
            setIsGoogleLoading(false)
        }
    }

    // Show loading while checking authentication status
    if (status === "loading") {
        return (
            <div className="flex justify-center items-center py-8">
                <Icons.spinner className="h-6 w-6 animate-spin" />
            </div>
        )
    }

    // Don't render signin form if already authenticated
    if (status === "authenticated") {
        return null
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

            <Tabs defaultValue="credentials" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="credentials">Sign In</TabsTrigger>
                    <TabsTrigger value="email">Magic Link</TabsTrigger>
                </TabsList>

                <TabsContent value="credentials" className="space-y-4">
                    <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="credentials-email">Email</Label>
                            <Input
                                id="credentials-email"
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
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="magic-email">Email</Label>
                            <Input
                                id="magic-email"
                                name="email"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isEmailLoading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isEmailLoading}>
                            {isEmailLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Send Magic Link
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
            >
                {isGoogleLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Icons.google className="mr-2 h-4 w-4" />
                )}
                Sign In with Google
            </Button>

            <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => router.push(`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
                >
                    Sign up here
                </Button>
            </div>
        </div>
    )
} 