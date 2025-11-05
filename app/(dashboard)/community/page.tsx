import CohortPeriodicTableFramer from '@/components/CohortPeriodicTableFramer';
import cohortsData from '@/data/cohorts.json';
import users from '@/data/users.json';
import type { Cohort } from '@/types/cohort';

export default function PeriodicFramerPage() {
  // Transform JSON data to match Cohort type
  const cohorts: Cohort[] = cohortsData.map(c => ({
    name: c.name,
    slug: c.slug,
    image: c.image,
    startDate: new Date(c.start_date),
    endDate: c.end_date ? new Date(c.end_date) : null,
  }));

  const cohortsByStartDate = cohorts.sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );
  return (
    <CohortPeriodicTableFramer cohorts={cohortsByStartDate} users={users} />
  );
}
