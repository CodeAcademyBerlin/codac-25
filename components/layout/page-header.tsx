import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const titleSizes = {
  sm: "text-2xl",
  md: "text-3xl", 
  lg: "text-4xl"
};

const descriptionSizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl"
};

export function PageHeader({ 
  title, 
  description, 
  children, 
  className,
  size = "md"
}: PageHeaderProps) {
  return (
    <div className={cn("mb-4 md:mb-8", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className={cn(
            "font-bold tracking-tight",
            titleSizes[size]
          )}>
            {title}
          </h1>
          {description && (
            <p className={cn(
              "text-muted-foreground",
              descriptionSizes[size]
            )}>
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
    </div>
  );
}