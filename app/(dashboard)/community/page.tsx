import CohortPeriodicTableFramer from '@/components/CohortPeriodicTableFramer';
import cohorts from '@/data/cohorts.json';
import users from '@/data/users.json';

export default function PeriodicFramerPage() {
  const cohortsByStartDate = cohorts.sort(
    (a, b) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
  return (
    <CohortPeriodicTableFramer cohorts={cohortsByStartDate} users={users} />
  );
}
