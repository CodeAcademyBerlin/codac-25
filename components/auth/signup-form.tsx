"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/ui/icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SignUpFormProps {
    callbackUrl?: string
}

export function SignUpForm({ callbackUrl = "/" }: SignUpFormProps) {
    const router = useRouter()

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | undefined>()
    const [success, setSuccess] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user starts typing
        if (error) setError(undefined)
    }

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Name is required")
            return false
        }
        if (!formData.email.trim()) {
            setError("Email is required")
            return false
        }
        if (!formData.password) {
            setError("Password is required")
            return false
        }
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long")
            return false
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setError(undefined)

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to create account")
            }

            setSuccess(true)
            // Redirect to sign in page after successful registration
            setTimeout(() => {
                router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`)
            }, 2000)

        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during registration.")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-green-600">
                        Account Created!
                    </CardTitle>
                    <CardDescription className="text-center">
                        Your account has been created successfully. Redirecting to sign in...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Icons.checkCircle className="h-16 w-16 text-green-600" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                    Create Account
                </CardTitle>
                <CardDescription className="text-center">
                    Join CODAC and start your learning journey
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password (min. 8 characters)"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                            minLength={8}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Button
                        variant="link"
                        className="p-0 h-auto font-normal"
                        onClick={() => router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
                        disabled={isLoading}
                    >
                        Sign in here
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
} 