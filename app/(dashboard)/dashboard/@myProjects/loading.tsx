import { Grid, Section } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyProjectsLoading() {
  return (
    <Section>
      <div className='flex items-center justify-between mb-6'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-40' />
          <Skeleton className='h-4 w-48' />
        </div>
        <Skeleton className='h-10 w-24' />
      </div>

      <Grid cols={3}>
        {[1, 2, 3].map(i => (
          <div key={i} className='border rounded-lg overflow-hidden'>
            <Skeleton className='h-48 w-full' />
            <div className='p-4 space-y-3'>
              <Skeleton className='h-6 w-3/4' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
              <div className='flex gap-2 pt-2'>
                <Skeleton className='h-6 w-16' />
                <Skeleton className='h-6 w-20' />
              </div>
            </div>
          </div>
        ))}
      </Grid>
    </Section>
  );
}
