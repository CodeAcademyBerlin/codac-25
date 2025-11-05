'use client';

import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import { Globe, LayoutGrid, RotateCcw, Sparkles } from 'lucide-react';
import type { LayoutType } from '@/lib/cohort-visualization-utils';

interface LayoutControlsProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  onReset: () => void;
}

export function LayoutControls({
  currentLayout,
  onLayoutChange,
  onReset,
}: LayoutControlsProps) {
  return (
    <div className='p-6 border-b border-white/10'>
      <div className='flex items-center justify-between mb-3'>
        <h2 className='text-white text-sm font-semibold'>Layout Mode</h2>
        <button
          onClick={onReset}
          className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all text-sm font-medium'
          title='Reset view'
        >
          <RotateCcw className='w-4 h-4' />
          <span>Reset</span>
        </button>
      </div>
      <Menubar className='border-white/10 bg-black/20'>
        <MenubarMenu>
          <MenubarTrigger
            onClick={() => onLayoutChange('grid')}
            className={`flex items-center gap-2 ${
              currentLayout === 'grid'
                ? 'bg-blue-500 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutGrid className='w-4 h-4' />
            <span>Grid</span>
          </MenubarTrigger>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger
            onClick={() => onLayoutChange('sphere')}
            className={`flex items-center gap-2 ${
              currentLayout === 'sphere'
                ? 'bg-purple-500 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Globe className='w-4 h-4' />
            <span>Sphere</span>
          </MenubarTrigger>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger
            onClick={() => onLayoutChange('helix')}
            className={`flex items-center gap-2 ${
              currentLayout === 'helix'
                ? 'bg-pink-500 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className='w-4 h-4' />
            <span>Helix</span>
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}

