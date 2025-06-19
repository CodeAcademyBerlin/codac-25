"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/ui/icons"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const emailSchema = z.object({
    email: z.string().email("Invalid email address"),
})

type EmailFormValues = z.infer<typeof emailSchema>

export function SignInForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const callbackUrl = searchParams?.get("callbackUrl") || "/"
    const errorParam = searchParams?.get("error")

    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = async (data: EmailFormValues) => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await signIn("email", {
                email: data.email,
                callbackUrl,
                redirect: false,
            })

            if (result?.error) {
                setError("Failed to send sign-in email. Please try again.")
            } else {
                router.push("/auth/verify-request")
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true)
        setError(null)

        try {
            await signIn("google", { callbackUrl })
        } catch (error) {
            setError("Failed to sign in with Google. Please try again.")
            setIsGoogleLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {(error || errorParam) && (
                <Alert variant="destructive">
                    <AlertDescription>
                        {error || getErrorMessage(errorParam)}
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        disabled={isLoading}
                        {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In with Email
                </Button>
            </form>

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
        </div>
    )
}

function getErrorMessage(error: string | null): string {
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