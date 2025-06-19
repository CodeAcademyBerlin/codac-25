import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface ErrorPageProps {
    searchParams: {
        error?: string
    }
}

export default function ErrorPage({ searchParams }: ErrorPageProps) {
    const error = searchParams.error

    const getErrorMessage = (error: string | undefined): string => {
        switch (error) {
            case "Configuration":
                return "There is a problem with the server configuration."
            case "AccessDenied":
                return "Access denied. You do not have permission to sign in."
            case "Verification":
                return "The verification token has expired or has already been used."
            case "Default":
            default:
                return "An error occurred during authentication."
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-destructive/10 p-3">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Authentication Error
                    </CardTitle>
                    <CardDescription>
                        Something went wrong during the authentication process.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {getErrorMessage(error)}
                        </AlertDescription>
                    </Alert>
                    <div className="flex flex-col space-y-2">
                        <Button asChild>
                            <Link href="/auth/signin">
                                Try Again
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 