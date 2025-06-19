"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"


export function SignOutButton() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSignOut = async () => {
        setIsLoading(true)
        try {
            await signOut({ callbackUrl: "/" })
        } catch {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col space-y-2">
            <Button
                onClick={handleSignOut}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
            >
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Sign Out
            </Button>
            <Button asChild variant="outline" className="w-full">
                <Link href="/">
                    Cancel
                </Link>
            </Button>
        </div>
    )
} 