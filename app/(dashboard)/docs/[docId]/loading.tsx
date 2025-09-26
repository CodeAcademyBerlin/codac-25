import { VerticalToolbarSkeleton } from '@/components/skeleton/vertical-toolbar-skeletob';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Skeleton } from '@/components/ui/skeleton';

const SIDE_PANEL_DEFAULT_SIZE = 15;
const MAIN_PANEL_DEFAULT_SIZE = 100 - SIDE_PANEL_DEFAULT_SIZE;

const SIDE_PANEL_MIN_SIZE = 10;
const SIDE_PANEL_MAX_SIZE = 25;

const MAIN_PANEL_MAX_SIZE = 100 - SIDE_PANEL_MIN_SIZE;
const MAIN_PANEL_MIN_SIZE = 100 - SIDE_PANEL_MAX_SIZE;



function DocumentSkeleton() {
  return (
    <div className='flex flex-col h-full w-full'>
      {/* Editor header skeleton */}
      <div className='border-b bg-muted/30 px-4 py-2'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-6 w-32' />
          <div className='flex items-center gap-2'>
            <Skeleton className='h-6 w-16' />
            <Skeleton className='h-6 w-20' />
          </div>
        </div>
      </div>

      {/* Editor content skeleton */}
      <div className='flex-1 p-6'>
        <div className='max-w-4xl mx-auto space-y-4'>
          {/* Title skeleton */}
          <Skeleton className='h-8 w-3/4' />

          {/* Paragraph skeletons */}
          <div className='space-y-3'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-5/6' />
          </div>

          {/* Another paragraph */}
          <div className='space-y-3 mt-6'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-4/5' />
          </div>

          {/* List skeleton */}
          <div className='space-y-2 mt-6'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-2/3' />
            <Skeleton className='h-4 w-5/6' />
          </div>

          {/* More content */}
          <div className='space-y-3 mt-8'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
          </div>

          {/* Code block skeleton */}
          <div className='mt-8'>
            <Skeleton className='h-32 w-full rounded-lg' />
          </div>

          {/* Final paragraph */}
          <div className='space-y-3 mt-8'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-4/5' />
          </div>
        </div>
      </div>
    </div>
  );
}
export default function DocumentLoading() {
  return (
    <div className='min-h-screen bg-background'>
      <ResizablePanelGroup direction='horizontal' className='h-full w-full'>
        <ResizablePanel
          defaultSize={SIDE_PANEL_DEFAULT_SIZE}
          minSize={SIDE_PANEL_MIN_SIZE}
          maxSize={SIDE_PANEL_MAX_SIZE}
        >
          <VerticalToolbarSkeleton />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={MAIN_PANEL_DEFAULT_SIZE}
          minSize={MAIN_PANEL_MIN_SIZE}
          maxSize={MAIN_PANEL_MAX_SIZE}
        >
          <DocumentSkeleton />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
