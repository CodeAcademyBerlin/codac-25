'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import type { LayoutType } from '@/lib/cohort-visualization-utils';
import type { Cohort, User } from '@/types/cohort';
import { useMemo, useState } from 'react';
import { CohortDetailPanel } from './community/cohort-detail-panel';
import { EmptyState } from './community/empty-state';
import { LayoutControls } from './community/layout-controls';
import { VisualizationContainer } from './community/visualization-container';

interface CohortPeriodicTableFramerProps {
  cohorts: Cohort[];
  users: User[];
}

export default function CohortPeriodicTableFramer({
  cohorts,
  users,
}: CohortPeriodicTableFramerProps) {
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('grid');

  const selectedCohortData = selectedCohort
    ? cohorts.find(c => c.slug === selectedCohort)
    : null;

  const currentIndex = selectedCohort
    ? cohorts.findIndex(c => c.slug === selectedCohort)
    : -1;

  const hasNext = currentIndex >= 0 && currentIndex < cohorts.length - 1;
  const hasPrevious = currentIndex > 0;

  // Members for the selected cohort (used in the detail panel)
  const selectedCohortMembers = useMemo(
    () => users.filter(user => user.cohort === selectedCohortData?.slug),
    [users, selectedCohortData?.slug]
  );

  const handleNext = () => {
    if (hasNext) {
      setSelectedCohort(cohorts[currentIndex + 1].slug);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      setSelectedCohort(cohorts[currentIndex - 1].slug);
    }
  };

  const handleResetView = () => {
    setSelectedCohort(null);
  };

  return (
    <div className='relative w-full h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden'>
      <ResizablePanelGroup direction='horizontal' className='h-screen'>
        {/* 3D Visualization Panel */}
        <ResizablePanel defaultSize={80} minSize={60}>
          <VisualizationContainer
            cohorts={cohorts}
            users={users}
            selectedCohort={selectedCohort}
            currentLayout={currentLayout}
            onSelectCohort={setSelectedCohort}
          />
        </ResizablePanel>

        {/* Resizable Handle */}
        <ResizableHandle />

        {/* Detail Panel */}
        <ResizablePanel defaultSize={20} minSize={20} maxSize={50}>
          <div className='h-full bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden'>
            {/* Layout Controls */}
            <LayoutControls
              currentLayout={currentLayout}
              onLayoutChange={setCurrentLayout}
              onReset={handleResetView}
            />

            {selectedCohortData ? (
              <CohortDetailPanel
                cohort={selectedCohortData}
                members={selectedCohortMembers}
                currentIndex={currentIndex}
                totalCount={cohorts.length}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onClose={() => setSelectedCohort(null)}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
