import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-4xl mx-auto",
  md: "max-w-6xl mx-auto",
  lg: "max-w-7xl mx-auto", 
  xl: "max-w-screen-2xl mx-auto",
  full: "w-full"
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6", 
  lg: "p-8"
};

export function PageContainer({ 
  children, 
  className,
  size = "lg",
  padding = "md"
}: PageContainerProps) {
  return (
    <div className={cn(
      "flex flex-1 flex-col",
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}