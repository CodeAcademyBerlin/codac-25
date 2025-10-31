import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PageHeader({
  title,
  description,
  size = 'md',
  className,
}: PageHeaderProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div className={cn('mb-8', className)}>
      <h1
        className={cn(
          'font-bold tracking-tight text-foreground',
          sizeClasses[size]
        )}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

