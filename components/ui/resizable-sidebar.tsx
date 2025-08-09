'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

interface ResizableSidebarProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  storageKey?: string;
}

export function ResizableSidebar({
  children,
  defaultWidth = 320,
  minWidth = 200,
  maxWidth = 600,
  className,
  storageKey
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Check for mobile and load width from localStorage on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (storageKey && typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem(storageKey);
      if (savedWidth) {
        const parsedWidth = parseInt(savedWidth, 10);
        if (!isNaN(parsedWidth) && parsedWidth >= minWidth && parsedWidth <= maxWidth) {
          setWidth(parsedWidth);
        }
      }
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [storageKey, minWidth, maxWidth]);

  // Save width to localStorage when changed
  const updateWidth = useCallback((newWidth: number) => {
    const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    setWidth(clampedWidth);
    
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, clampedWidth.toString());
    }
  }, [minWidth, maxWidth, storageKey]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;

      const rect = sidebarRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      updateWidth(newWidth);
    },
    [isResizing, updateWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      };
    }
    
    return undefined;
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={sidebarRef}
      className={cn('relative flex', className)}
      style={isMobile ? undefined : { width: `${width}px` }}
    >
      <div className="flex-1">
        {children}
      </div>
      
      {/* Resize Handle - hidden on mobile */}
      {!isMobile && (
        <div
          className={cn(
            'group absolute right-0 top-0 h-full w-2 cursor-ew-resize transition-colors hover:bg-border/50 active:bg-border flex items-center justify-center',
            isResizing && 'bg-border'
          )}
          onMouseDown={handleMouseDown}
          title="Drag to resize sidebar"
        >
          <div className="h-8 w-0.5 bg-border group-hover:bg-primary transition-colors rounded-full" />
        </div>
      )}
    </div>
  );
}