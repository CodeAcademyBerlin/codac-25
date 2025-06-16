import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LearningProgress } from "@/components/dashboard/learning-progress"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"

export default function Page() {
  return (
    <div>
      <DashboardHeader />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Alex!</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening in your learning journey today.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

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
