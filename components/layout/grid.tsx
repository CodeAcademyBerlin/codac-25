import { cn } from "@/lib/utils";

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: "1" | "2" | "3" | "4" | "auto";
  gap?: "sm" | "md" | "lg";
  responsive?: boolean;
}

const colsClasses = {
  "1": "grid-cols-1",
  "2": "grid-cols-1 md:grid-cols-2",
  "3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  "4": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  "auto": "grid-cols-[repeat(auto-fit,minmax(300px,1fr))]"
};

const gapClasses = {
  sm: "gap-3 md:gap-4",
  md: "gap-4 md:gap-6",
  lg: "gap-6 md:gap-8"
};

export function Grid({ 
  children, 
  className,
  cols = "3",
  gap = "md",
  responsive = true
}: GridProps) {
  return (
    <div className={cn(
      "grid",
      responsive ? colsClasses[cols] : `grid-cols-${cols}`,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <Grid 
      cols="4" 
      gap="md" 
      className={cn("grid-cols-1 md:grid-cols-2 lg:grid-cols-4", className)}
    >
      {children}
    </Grid>
  );
}