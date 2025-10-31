import { cn } from '@/lib/utils';

interface StatsGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({
  children,
  cols = 4,
  className,
}: StatsGridProps) {
  const colsClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn('grid gap-4', colsClasses[cols], className)}
    >
      {children}
    </div>
  );
}

