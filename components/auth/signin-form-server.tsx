import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import { SignInFormClient } from "@/components/auth/signin-form-client"

interface SignInFormProps {
    searchParams?: {
        callbackUrl?: string
        error?: string
    }
}



export async function SignInForm({ searchParams }: SignInFormProps) {
    // Check if user is already authenticated
    const session = await auth()
    if (session) {
        redirect(searchParams?.callbackUrl || "/")
    }

    const callbackUrl = searchParams?.callbackUrl || "/"
    const error = searchParams?.error

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInFormClient callbackUrl={callbackUrl} serverError={error} />
        </Suspense>
    )
} 