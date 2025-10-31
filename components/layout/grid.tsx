import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Grid({
  children,
  cols = 2,
  gap = 'md',
  className,
}: GridProps) {
  const colsClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  
  const colsKey = typeof cols === 'number' && cols >= 1 && cols <= 4 ? cols : 2;

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div
      className={cn('grid', colsClasses[colsKey], gapClasses[gap], className)}
    >
      {children}
    </div>
  );
}

