import { Users } from 'lucide-react';

import { CohortDistributionChart } from '@/components/dashboard/cohort-distribution-chart';
import { SectionErrorBoundary } from '@/components/error/section-error-boundary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCohortDistribution } from '@/data/cohort/get-cohort-stats';

export const dynamic = 'force-dynamic';

export default async function CohortDistributionSlot() {
  const cohortData = await getCohortDistribution();

  return (
    <SectionErrorBoundary sectionName='cohort distribution'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-primary' />
                Cohort Distribution
              </CardTitle>
              <CardDescription>
                Student enrollment across cohorts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {cohortData.length > 0 ? (
            <CohortDistributionChart data={cohortData} />
          ) : (
            <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
              No cohort data available
            </div>
          )}
        </CardContent>
      </Card>
    </SectionErrorBoundary>
  );
}
