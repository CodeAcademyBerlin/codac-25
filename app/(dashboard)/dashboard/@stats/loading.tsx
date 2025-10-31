import { Grid, Section } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatsLoading() {
  return (
    <Section>
      <Grid cols={4}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className='border rounded-lg p-6 space-y-3'>
            <div className='flex justify-between items-center'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4 rounded' />
            </div>
            <Skeleton className='h-8 w-16' />
            <Skeleton className='h-3 w-20' />
          </div>
        ))}
      </Grid>
    </Section>
  );
}
