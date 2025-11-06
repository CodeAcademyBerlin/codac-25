import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
      role='status'
      aria-live='polite'
    >
      {Icon && (
        <Icon
          className='h-16 w-16 text-muted-foreground mb-4'
          aria-hidden='true'
        />
      )}
      <h3 className='text-lg font-semibold mb-2'>{title}</h3>
      <p className='text-muted-foreground max-w-md mb-6'>{description}</p>
      {action && (
        <Button variant='outline' onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

