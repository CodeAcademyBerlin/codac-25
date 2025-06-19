import { SignUpForm } from "@/components/auth/signup-form"

interface SignUpPageProps {
    searchParams?: Promise<{
        callbackUrl?: string
    }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
    const params = await searchParams

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <SignUpForm callbackUrl={params?.callbackUrl} />
        </div>
    )
} 