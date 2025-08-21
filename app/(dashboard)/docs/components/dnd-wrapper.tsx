'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DndWrapperProps {
  children: React.ReactNode;
}

export function DndWrapper({ children }: DndWrapperProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
} 