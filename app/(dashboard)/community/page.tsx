import CohortPeriodicTableFramer from '@/components/CohortPeriodicTableFramer';
import cohorts from '@/data/cohorts.json';
import users from '@/data/users.json';

export default function PeriodicFramerPage() {
  return <CohortPeriodicTableFramer cohorts={cohorts} users={users} />;
}
