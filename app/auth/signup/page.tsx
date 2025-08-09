import { SignUpForm } from "@/components/auth/signup-form"

interface SignUpPageProps {
    searchParams?: Promise<{
        callbackUrl?: string
    }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
    const params = await searchParams

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <SignUpForm callbackUrl={params?.callbackUrl} />
        </div>
    )
} 