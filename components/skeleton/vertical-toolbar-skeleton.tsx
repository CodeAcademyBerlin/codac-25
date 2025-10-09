import { Skeleton } from '../ui/skeleton';

export function VerticalToolbarSkeleton() {
  return (
    <div className='sticky top-0 left-0 z-50 h-full w-full rounded-l-lg border-r border-r-border bg-background/95 p-3 backdrop-blur-sm supports-backdrop-blur:bg-background/60 flex-col gap-2'>
      <div className='flex h-full w-full flex-col gap-4'>
        {/* Toolbar groups skeleton */}
        <div className='flex flex-col gap-3'>
          {/* First group - Save, Undo, Redo, Comments */}
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
          </div>

          {/* Second group - AI, Export, Import */}
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
          </div>

          {/* Third group - Text formatting */}
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
          </div>

          {/* Fourth group - Alignment */}
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
          </div>

          {/* Fifth group - Lists */}
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
          </div>

          {/* Sixth group - Links, Table, Emoji */}
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
          </div>

          {/* Seventh group - Media */}
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
          </div>
        </div>

        {/* Spacer */}
        <div className='flex-1' />

        {/* Bottom group */}
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-8 w-full rounded' />
        </div>
      </div>
    </div>
  );
}
