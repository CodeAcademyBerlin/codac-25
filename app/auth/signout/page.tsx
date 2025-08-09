import { LogOut } from "lucide-react"

import { SignOutButton } from "@/components/auth/signout-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignOutPage() {
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-primary/10 p-3">
                            <LogOut className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Sign Out
                    </CardTitle>
                    <CardDescription>
                        Are you sure you want to sign out of your account?
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignOutButton />
                </CardContent>
            </Card>
        </div>
    )
} 