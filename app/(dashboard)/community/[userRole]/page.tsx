import {
  Award,
  Briefcase,
  Calendar,
  GraduationCap,
  MessageSquare,
  Trophy,
  Users,
} from 'lucide-react';
import { notFound } from 'next/navigation';

import { StudentCard } from '@/components/community/student-card';
import {
  EmptyState,
  Grid,
  PageContainer,
  PageHeader,
  SearchFilter,
  Section,
  SectionHeader,
  StatsCard,
  StatsGrid,
} from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getUsers } from '@/data/user/get-users';
import { requireServerAuth } from '@/lib/auth/auth-server';
import { UserWithCounts } from '@/lib/utils/server-action-utils';

type Params = {
  userRole: string;
};

const roleConfig = {
  students: {
    title: 'Alumni',
    description:
      'Connect with our graduates and celebrate their continued success',
    role: 'STUDENT' as const,
    statusFilter: null,
    emptyMessage: 'There are no alumni to display at the moment.',
    sections: {
      active: {
        title: 'Graduated Alumni',
        description: 'Successfully completed the program',
      },
      inactive: {
        title: 'Legacy Members',
        description: 'Part of our community history',
      },
    },
  },
  mentors: {
    title: 'Mentors',
    description:
      'Connect with our mentors who guided students throughout their journey',
    role: 'MENTOR' as const,
    statusFilter: null,
    emptyMessage: 'There are no mentors to display at the moment.',
    sections: {
      active: {
        title: 'Former Mentors',
        description: "Mentors who shaped our students' success",
      },
      inactive: {
        title: 'Other Mentors',
        description: 'Previous mentors and inactive profiles',
      },
    },
  },
  alumni: {
    title: 'Alumni',
    description:
      'Celebrate the success of our graduates and stay connected with the community',
    role: null,
    statusFilter: 'GRADUATED' as const,
    emptyMessage: 'There are no alumni to display at the moment.',
    sections: {
      active: {
        title: 'Recent Graduates',
        description: 'Our newest alumni making their mark in the industry',
      },
      inactive: {
        title: 'All Alumni',
        description: 'Our complete alumni network',
      },
    },
  },
};

export async function generateStaticParams() {
  return [{ role: 'students' }, { role: 'mentors' }, { role: 'alumni' }];
}

export default async function CommunityRolePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { userRole } = await params;

  if (!roleConfig[userRole as keyof typeof roleConfig]) {
    notFound();
  }

  const config = roleConfig[userRole as keyof typeof roleConfig];

  // Get current user
  const user = await requireServerAuth();
  const currentUserId = user.id;

  const queryParams: {
    limit: number;
    offset: number;
    role?: 'STUDENT' | 'MENTOR' | 'ALUMNI' | 'ADMIN';
    status?: 'GRADUATED' | 'ACTIVE' | 'INACTIVE';
  } = {
    limit: 50,
    offset: 0,
  };

  if (config.role) {
    queryParams.role = config.role;
  }

  if (config.statusFilter) {
    queryParams.status = config.statusFilter;
  }

  const result = await getUsers(queryParams);

  if (!result.success || !result.data) {
    return (
      <PageContainer>
        <PageHeader
          title={config.title}
          description={config.description}
          size='lg'
        />
        <EmptyState
          icon={Users}
          title={`Failed to load ${userRole}`}
          description='There was an error loading the data. Please try again later.'
        />
      </PageContainer>
    );
  }

  const { users, total } = result.data;

  // Filter users based on role-specific logic
  let activeUsers: UserWithCounts[] = [];
  let inactiveUsers: UserWithCounts[] = [];

  let employedCount: number = 0;
  let recentCount: number = 0;

  if (userRole === 'alumni') {
    const currentYear = new Date().getFullYear();
    activeUsers = users.filter(
      user =>
        user.endDate && new Date(user.endDate).getFullYear() >= currentYear - 2
    );
    inactiveUsers = users.filter(
      user =>
        !user.endDate || new Date(user.endDate).getFullYear() < currentYear - 2
    );
    employedCount = users.filter(
      user => user.currentJob || user.currentCompany
    ).length;
    recentCount = activeUsers.length;
  } else {
    activeUsers = users.filter(user => user.status === 'ACTIVE');
    inactiveUsers = users.filter(user => user.status === 'INACTIVE');
  }

  const renderStats = () => {
    if (userRole === 'alumni') {
      return (
        <StatsGrid>
          <StatsCard
            title='Total Alumni'
            value={total}
            description='All time'
            icon={GraduationCap}
          />
          <StatsCard
            title='Recent Graduates'
            value={recentCount}
            description='Last 2 years'
            icon={Calendar}
          />
          <StatsCard
            title='Employed'
            value={employedCount}
            description='With current jobs'
            icon={Briefcase}
          />
          <StatsCard
            title='Success Rate'
            value={`${total > 0 ? Math.round((employedCount / total) * 100) : 0}%`}
            description='Employment rate'
            icon={Trophy}
          />
        </StatsGrid>
      );
    }

    const icon = userRole === 'mentors' ? Award : GraduationCap;

    return (
      <StatsGrid cols={3}>
        <StatsCard
          title={`Total ${config.title}`}
          value={total}
          description='All time'
          icon={Users}
        />
        <StatsCard
          title='Graduated'
          value={activeUsers.length}
          description={
            userRole === 'mentors' ? 'Former mentors' : 'Successfully completed'
          }
          icon={icon}
        />
        <StatsCard
          title='Showing'
          value={users.length}
          description={`Of ${total} total`}
          icon={Users}
        />
      </StatsGrid>
    );
  };

  const renderCallToAction = () => {
    if (userRole === 'mentors') {
      return (
        <Section>
          <Card className='p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800'>
            <div className='text-center'>
              <MessageSquare className='h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold mb-2'>
                Thank You, Mentors!
              </h3>
              <p className='text-muted-foreground'>
                Our mentors played a crucial role in shaping the success of our
                graduates. Your guidance and support made a lasting impact on
                our community.
              </p>
            </div>
          </Card>
        </Section>
      );
    }

    if (userRole === 'alumni' || userRole === 'students') {
      return (
        <Section>
          <Card className='p-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800'>
            <div className='text-center'>
              <Trophy className='h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold mb-2'>
                Alumni Success Stories
              </h3>
              <p className='text-muted-foreground mb-6'>
                Our graduates are making incredible contributions across the
                tech industry. From startups to Fortune 500 companies,
                they&apos;re building the future.
              </p>
              <div className='flex justify-center gap-4'>
                <Button variant='outline'>Share Your Story</Button>
                <Button className='bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'>
                  View Success Stories
                </Button>
              </div>
            </div>
          </Card>
        </Section>
      );
    }

    return null;
  };

  return (
    <PageContainer size='xl'>
      <PageHeader
        title={config.title}
        description={config.description}
        size='lg'
      />

      {/* Stats Overview */}
      <Section>{renderStats()}</Section>

      {/* Search and Filter */}
      <Section>
        <SearchFilter
          searchPlaceholder={`Search ${userRole}...`}
          onSearchChange={() => {
            // TODO: Implement search functionality
          }}
        />
      </Section>

      {/* Active/Recent Section */}
      {activeUsers.length > 0 && (
        <Section>
          <SectionHeader
            title={config.sections.active.title}
            description={config.sections.active.description}
            badge={
              <Badge variant='secondary' className='text-sm'>
                {activeUsers.length}{' '}
                {userRole === 'alumni'
                  ? 'recent'
                  : userRole === 'mentors'
                    ? 'available'
                    : 'active'}
              </Badge>
            }
          />

          <Grid cols={4}>
            {activeUsers.map(user => (
              <StudentCard
                key={user.id}
                student={user}
                currentUserId={currentUserId}
              />
            ))}
          </Grid>
        </Section>
      )}

      {/* Inactive/Other Section */}
      {inactiveUsers.length > 0 && (
        <Section>
          <SectionHeader
            title={config.sections.inactive.title}
            description={config.sections.inactive.description}
            badge={
              <Badge variant='outline' className='text-sm'>
                {inactiveUsers.length}{' '}
                {userRole === 'alumni' ? 'alumni' : userRole}
              </Badge>
            }
          />

          <Grid cols={4}>
            {inactiveUsers.map(user => (
              <StudentCard
                key={user.id}
                student={user}
                currentUserId={currentUserId}
              />
            ))}
          </Grid>
        </Section>
      )}

      {/* Load More Button */}
      {users.length < total && (
        <Section>
          <div className='text-center'>
            <Button variant='outline' size='lg'>
              Load More {config.title}
            </Button>
          </div>
        </Section>
      )}

      {/* Empty State */}
      {users.length === 0 && (
        <Section>
          <EmptyState
            icon={Users}
            title={`No ${userRole} found`}
            description={config.emptyMessage}
          />
        </Section>
      )}

      {/* Call to Action */}
      {renderCallToAction()}
    </PageContainer>
  );
}
