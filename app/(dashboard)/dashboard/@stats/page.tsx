import { Code, Star, Trophy, Users } from 'lucide-react';

import { Grid, Section } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProjectStats } from '@/data/projects/get-project-stats';
import { getUserProjects } from '@/data/projects/get-projects';

export const dynamic = 'force-dynamic';

export default async function StatsSlot() {
  let userProjects: Awaited<ReturnType<typeof getUserProjects>> = [];
  let stats: Awaited<ReturnType<typeof getProjectStats>> = {
    totalStudents: 0,
    totalProjects: 0,
    totalSkills: 0,
    featuredProjects: 0,
    activeStudents: 0,
    newThisMonth: 0,
  };

  try {
    [userProjects, stats] = await Promise.all([
      getUserProjects(),
      getProjectStats(),
    ]);
  } catch (error) {
    console.error('Error loading stats:', error);
    // Fallback data already set above
  }

  return (
    <Section>
      <Grid cols={4}>
        <Card className='border-codac-pink/20'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              My Projects
            </CardTitle>
            <Code className='h-4 w-4 text-primary' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-primary'>
              {userProjects.length}
            </div>
            <p className='text-xs text-muted-foreground'>
              {userProjects.filter(p => p.isPublic).length} public
            </p>
          </CardContent>
        </Card>

        <Card className='border-codac-teal/20 bg-codac-teal/5'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Community Projects
            </CardTitle>
            <Trophy className='h-4 w-4 text-chart-2' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-chart-2'>
              {stats.totalProjects}
            </div>
            <p className='text-xs text-muted-foreground'>
              {stats.featuredProjects} featured
            </p>
          </CardContent>
        </Card>

        <Card className='border-codac-pink/20 bg-codac-pink/5'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Students
            </CardTitle>
            <Users className='h-4 w-4 text-chart-3' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-chart-3'>
              {stats.activeStudents}
            </div>
            <p className='text-xs text-muted-foreground'>Building projects</p>
          </CardContent>
        </Card>

        <Card className='border-transparent bg-gradient-codac text-white shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-white'>
              This Month
            </CardTitle>
            <Star className='h-4 w-4 text-white' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-white'>
              {stats.newThisMonth}
            </div>
            <p className='text-xs text-white/80'>New projects</p>
          </CardContent>
        </Card>
      </Grid>
    </Section>
  );
}
