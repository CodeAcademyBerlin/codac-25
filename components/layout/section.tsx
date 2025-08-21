import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
}

const spacingClasses = {
  sm: "space-y-3 md:space-y-4",
  md: "space-y-4 md:space-y-6",
  lg: "space-y-6 md:space-y-8"
};

export function Section({ 
  children, 
  className,
  spacing = "md"
}: SectionProps) {
  return (
    <section className={cn(
      spacingClasses[spacing],
      className
    )}>
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ 
  title, 
  description, 
  badge,
  children, 
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3 md:mb-6", className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">{title}</h2>
          {badge}
        </div>
        {description && (
          <p className="text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex-shrink-0 ml-4">
          {children}
        </div>
      )}
    </div>
  );
}