"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LearningProgress } from "@/components/dashboard/learning-progress"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { Icons } from "@/components/ui/icons"

interface UserData {
  id: string
  name?: string | null
  email?: string | null
  role?: string
  status?: string
}

interface UserStats {
  documentsCount: number
  achievementsCount: number
  studyStreak: number
  monthlyStudyTime: number
}

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin?callbackUrl=" + encodeURIComponent("/"))
    }
  }, [status, router])

  // Set user data when session is available
  useEffect(() => {
    if (session?.user) {
      setUserData({
        id: session.user.id || "",
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        status: session.user.status,
      })
    }
  }, [session])

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!userData?.id) return

      setIsLoadingStats(true)
      try {
        const response = await fetch('/api/user/stats')

        if (!response.ok) {
          throw new Error('Failed to fetch user stats')
        }

        const stats = await response.json()
        setUserStats(stats)
      } catch (error) {
        console.error('Failed to fetch user stats:', error)
        // Set default stats on error
        setUserStats({
          documentsCount: 0,
          achievementsCount: 0,
          studyStreak: 0,
          monthlyStudyTime: 0,
        })
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchUserStats()
  }, [userData?.id])

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (status === "unauthenticated") {
    return null
  }

  // Get user's first name for personalization
  const firstName = userData?.name?.split(" ")[0] || "there"
  const greeting = getGreeting()

  return (
    <div>
      <DashboardHeader />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening in your learning journey today.
          </p>
          {userData?.role && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="capitalize">{userData.role.toLowerCase()}</span>
              {userData.status && (
                <>
                  <span>•</span>
                  <span className="capitalize">{userData.status.toLowerCase()}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {isLoadingStats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <StatsCards userStats={userStats || undefined} />
        )}

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <LearningProgress />
          <UpcomingEvents />
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  )
}

// Helper function to get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours()

  if (hour < 12) {
    return "Good morning"
  } else if (hour < 17) {
    return "Good afternoon"
  } else {
    return "Good evening"
  }
}
