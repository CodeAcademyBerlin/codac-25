import { Plus } from 'lucide-react';
import Link from 'next/link';

import { CommunityStats } from '@/components/dashboard/community-stats';
import { FeaturedProjects } from '@/components/dashboard/featured-projects';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentProjects } from '@/components/dashboard/recent-projects';
import { Button } from '@/components/ui/button';
import { getDashboardStats } from '@/data/dashboard/get-dashboard-stats';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const statsResult = await getDashboardStats();
  const stats = statsResult.success
    ? statsResult.data
    : {
        totalStudents: 0,
        activeCohorts: 0,
        communityMembers: 0,
        totalMentors: 0,
      };

  return (
    <div className='space-y-6'>
      {/* Header with New Project Button */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Welcome back! Here's what's happening in your community.
          </p>
        </div>
        <Link href='/projects/create'>
          <Button variant='brandGradient'>
            <Plus className='h-4 w-4 mr-2' />
            New Project
          </Button>
        </Link>
      </div>

      {/* Community Statistics */}
      <CommunityStats stats={stats} />

      {/* Recent Projects Section */}
      <RecentProjects />

      {/* Featured Projects Section */}
      <FeaturedProjects />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
