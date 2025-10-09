import { Metadata } from 'next';
import { Suspense } from 'react';

import { LMSNavigation } from '@/components/lms/lms-navigation';
import { VerticalToolbarSkeleton } from '@/components/skeleton/vertical-toolbar-skeleton';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export const metadata: Metadata = {
  title: 'Learning Management System',
  description: 'Access your courses and learning materials',
};

interface LMSLayoutProps {
  children: React.ReactNode;
}

const SIDE_PANEL_DEFAULT_SIZE = 25;
const MAIN_PANEL_DEFAULT_SIZE = 100 - SIDE_PANEL_DEFAULT_SIZE;

const SIDE_PANEL_MIN_SIZE = 15;
const SIDE_PANEL_MAX_SIZE = 30;

const MAIN_PANEL_MAX_SIZE = 100 - SIDE_PANEL_MIN_SIZE;
const MAIN_PANEL_MIN_SIZE = 100 - SIDE_PANEL_MAX_SIZE;

export default function LMSLayout({ children }: LMSLayoutProps) {
  return (
    <div className='min-h-screen bg-background'>
      <div className='h-[calc(100vh-4rem)] flex flex-col'>
        <ResizablePanelGroup direction='horizontal' className='flex-1'>
          <ResizablePanel
            defaultSize={SIDE_PANEL_DEFAULT_SIZE}
            minSize={SIDE_PANEL_MIN_SIZE}
            maxSize={SIDE_PANEL_MAX_SIZE}
            className='border-r overflow-y-auto'
          >
            <Suspense fallback={<VerticalToolbarSkeleton />}>
              <LMSNavigation />
            </Suspense>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={MAIN_PANEL_DEFAULT_SIZE}
            minSize={MAIN_PANEL_MIN_SIZE}
            maxSize={MAIN_PANEL_MAX_SIZE}
            className='overflow-y-auto'
          >
            <Suspense
              fallback={<div className='p-4'>Loading LMS content...</div>}
            >
              {children}
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
