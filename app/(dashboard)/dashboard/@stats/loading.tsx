import { Skeleton } from '@/components/ui/skeleton';

export default function StatsLoading() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Skeleton className='h-32' />
      <Skeleton className='h-32' />
      <Skeleton className='h-32' />
      <Skeleton className='h-32' />
    </div>
  );
}

