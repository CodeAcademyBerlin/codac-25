import { Briefcase, Users, UsersRound, GraduationCap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardStats } from '@/data/dashboard/get-dashboard-stats';

interface StatCard {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface CommunityStatsProps {
  stats: DashboardStats;
}

export function CommunityStats({ stats }: CommunityStatsProps) {
  const statsData: StatCard[] = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toString(),
      description: 'Active learners',
      icon: GraduationCap,
    },
    {
      title: 'Active Cohorts',
      value: stats.activeCohorts.toString(),
      description: 'Learning groups',
      icon: UsersRound,
    },
    {
      title: 'Community Members',
      value: stats.communityMembers.toString(),
      description: 'Total active users',
      icon: Users,
    },
    {
      title: 'Mentors',
      value: stats.totalMentors.toString(),
      description: 'Available mentors',
      icon: Briefcase,
    },
  ];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {statsData.map(stat => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {stat.title}
              </CardTitle>
              <IconComponent className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground'>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

