import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      {Icon && (
        <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}