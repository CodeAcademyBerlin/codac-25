import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  badge,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {badge}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

