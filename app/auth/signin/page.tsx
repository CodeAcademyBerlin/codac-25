import { SignInForm } from "@/components/auth/signin-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SignInPageProps {
    searchParams?: Promise<{
        callbackUrl?: string
        error?: string
    }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
    const params = await searchParams

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Welcome to codac
                    </CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your account to continue your learning journey
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignInForm callbackUrl={params?.callbackUrl} />
                </CardContent>
            </Card>
        </div>
    )
} 