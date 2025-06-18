'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SettingsBarItemProperties = {
  readonly title: string;
  readonly children: ReactElement;
  readonly action?: ReactNode;
};

type SettingsBarProperties = {
  readonly children: ReactNode;
  readonly collapsedContent?: ReactNode;
};

const Root = ({ children, collapsedContent }: SettingsBarProperties) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "sticky top-0 flex h-screen shrink-0 flex-col gap-6 overflow-y-auto border-l p-3 pb-6 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-12" : "w-full max-w-[280px]"
    )}>
      <div className="flex items-center justify-between">
        {!isCollapsed && <div className="flex-1" />}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {!isCollapsed && children}
      {isCollapsed && collapsedContent && (
        <div className="flex flex-col items-center space-y-2">
          {collapsedContent}
        </div>
      )}
    </div>
  );
};

const Item = ({ title, children, action }: SettingsBarItemProperties) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">{title}</p>
      {action}
    </div>
    {children}
  </div>
);

export { Root, Item };
