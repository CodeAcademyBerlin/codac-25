"use client"

import { AlertCircle, CheckCircle, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ClearCookiesPage() {
    const [isClearing, setIsClearing] = useState(false)
    const [isCleared, setIsCleared] = useState(false)

    const clearNextAuthCookies = () => {
        setIsClearing(true)

        // List of NextAuth cookie names to clear
        const cookiesToClear = [
            'next-auth.session-token',
            '__Secure-next-auth.session-token',
            'authjs.session-token',
            'next-auth.csrf-token',
            '__Secure-next-auth.csrf-token',
            'authjs.csrf-token',
            'next-auth.callback-url',
            '__Secure-next-auth.callback-url',
            'authjs.callback-url',
        ]

        // Clear cookies
        cookiesToClear.forEach(cookieName => {
            // Clear for current domain
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            // Clear for current domain with secure flag
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`
            // Clear for localhost specifically
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`
        })

        setTimeout(() => {
            setIsClearing(false)
            setIsCleared(true)
            // Redirect to signin after clearing
            setTimeout(() => {
                window.location.href = '/auth/signin'
            }, 2000)
        }, 1000)
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                        <AlertCircle className="h-8 w-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl">HTTP 431 Error Fix</CardTitle>
                    <CardDescription>
                        Clear authentication cookies to resolve &quot;Request Header Fields Too Large&quot; error
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-800 mb-2">Why this happens:</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Large cookies from previous sessions</li>
                            <li>• Base64 encoded avatars in JWT tokens</li>
                            <li>• Accumulation of authentication data</li>
                        </ul>
                    </div>

                    {!isCleared ? (
                        <Button
                            onClick={clearNextAuthCookies}
                            disabled={isClearing}
                            className="w-full"
                            size="lg"
                        >
                            {isClearing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Clearing Cookies...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear Authentication Cookies
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <p className="text-green-800 font-semibold">Cookies Cleared Successfully!</p>
                            <p className="text-green-700 text-sm mt-1">Redirecting to sign in...</p>
                        </div>
                    )}

                    <div className="text-xs text-gray-500 text-center">
                        <p>This will log you out and clear all authentication cookies.</p>
                        <p>You&apos;ll need to sign in again after clearing.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 