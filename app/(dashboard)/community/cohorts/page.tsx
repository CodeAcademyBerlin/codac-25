import { Calendar, Users } from 'lucide-react';

import { CohortListCard } from '@/components/community/cohort-list-card';
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
import { getCohorts } from '@/data/cohort/get-cohorts';

export default async function CohortsPage() {
  const result = await getCohorts();

  if (!result.success || !result.data) {
    return (
      <PageContainer>
        <PageHeader title='Cohorts' description='Explore our completed cohorts' size='lg' />
        <EmptyState
          icon={Users}
          title='Failed to load cohorts'
          description={
            'error' in result
              ? typeof result.error === 'string'
                ? result.error
                : 'Invalid data format'
              : 'Failed to load cohorts'
          }
        />
      </PageContainer>
    );
  }

  const { cohorts, totalStudents } = result.data;

  const activeCohorts = cohorts.filter(cohort => cohort.startDate <= new Date());
  const upcomingCohorts = cohorts.filter(cohort => cohort.startDate > new Date());

  return (
    <PageContainer size='xl'>
      <PageHeader
        title='Cohorts'
        description='Explore our completed cohorts and celebrate their remarkable achievements'
        size='lg'
      />

      {/* Stats Overview */}
      <Section>
        <StatsGrid cols={3}>
          <StatsCard title='Total Cohorts' value={cohorts.length} description='Successfully completed' icon={Users} />
          <StatsCard
            title='Graduated Cohorts'
            value={activeCohorts.length}
            description='Concluded their journey'
            icon={Calendar}
          />
          <StatsCard title='Total Alumni' value={totalStudents} description='Across all cohorts' icon={Users} />
        </StatsGrid>
      </Section>

      {/* Search and Filter */}
      <Section>
        <SearchFilter
          searchPlaceholder='Search cohorts...'
          onSearchChange={() => {
            // TODO: Implement search functionality
          }}
        />
      </Section>

      {/* Completed Cohorts Section */}
      {activeCohorts.length > 0 && (
        <Section>
          <SectionHeader
            title='Completed Cohorts'
            description='Successfully concluded programs'
            badge={
              <Badge variant='secondary' className='text-sm'>
                {activeCohorts.length} completed
              </Badge>
            }
          />

          <Grid cols={3}>
            {activeCohorts.map(cohort => (
              <CohortListCard key={cohort.id} cohort={cohort} />
            ))}
          </Grid>
        </Section>
      )}

      {/* Legacy Cohorts Section */}
      {upcomingCohorts.length > 0 && (
        <Section>
          <SectionHeader
            title='Legacy Cohorts'
            description='Earlier cohorts from our academy'
            badge={
              <Badge variant='outline' className='text-sm'>
                {upcomingCohorts.length} legacy
              </Badge>
            }
          />

          <Grid cols={3}>
            {upcomingCohorts.map(cohort => (
              <CohortListCard key={cohort.id} cohort={cohort} />
            ))}
          </Grid>
        </Section>
      )}

      {/* Empty State */}
      {cohorts.length === 0 && (
        <Section>
          <EmptyState
            icon={Users}
            title='No cohorts found'
            description='The academy has completed its mission. Thank you to all our graduates!'
          />
        </Section>
      )}
    </PageContainer>
  );
}
