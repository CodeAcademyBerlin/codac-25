import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('', className)} role='article' aria-labelledby={`stat-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle id={`stat-${title.replace(/\s+/g, '-').toLowerCase()}`} className='text-sm font-medium'>{title}</CardTitle>
        {Icon && <Icon className='h-4 w-4 text-muted-foreground' aria-hidden='true' />}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold' aria-label={`${title}: ${value}`}>
          {value}
        </div>
        {description && (
          <p className='text-xs text-muted-foreground mt-1'>{description}</p>
        )}
        {trend && (
          <div
            className={cn(
              'text-xs mt-2 flex items-center',
              trend.positive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
            aria-label={`Trend: ${trend.positive ? 'up' : 'down'} ${trend.value}% ${trend.label}`}
          >
            <span className='font-medium'>
              {trend.positive ? '+' : ''}
              {trend.value}%
            </span>
            <span className='text-muted-foreground ml-1'>{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

