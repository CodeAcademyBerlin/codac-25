"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/ui/icons"
import { signInWithEmail, signInWithGoogle } from "@/actions/auth/signin"

interface SignInFormClientProps {
    callbackUrl: string
    serverError?: string
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Sign In with Email
        </Button>
    )
}

function GoogleSubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={pending}
        >
            {pending ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Icons.google className="mr-2 h-4 w-4" />
            )}
            Sign In with Google
        </Button>
    )
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

export function SignInFormClient({ callbackUrl, serverError }: SignInFormClientProps) {
    const [emailState, emailAction] = useActionState(signInWithEmail, null)
    const [googleState, googleAction] = useActionState(signInWithGoogle, null)

    const error = serverError || emailState?.error || googleState?.error

    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>
                        {getErrorMessage(error)}
                    </AlertDescription>
                </Alert>
            )}

            <form action={emailAction} className="space-y-4">
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        required
                    />
                </div>
                <SubmitButton />
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

            <form action={googleAction}>
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <GoogleSubmitButton />
            </form>
        </div>
    )
} 