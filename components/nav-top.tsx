"use client";

import { type LucideIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface NavigationItem {
  title: string;
  url: string;
  badge?: string;
}

export interface NavigationGroup {
  title: string;
  icon: LucideIcon;
  items: NavigationItem[];
}

export function NavTop({
  groups,
  ...props
}: {
  groups: NavigationGroup[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();
  const { state } = useSidebar();

  // State for tracking collapsed categories (only used when sidebar is expanded)
  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sidebar-collapsed-categories");
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Save to localStorage whenever collapsedCategories changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "sidebar-collapsed-categories",
        JSON.stringify(Array.from(collapsedCategories))
      );
    }
  }, [collapsedCategories]);

  const toggleCategory = React.useCallback((categoryTitle: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryTitle)) {
        newSet.delete(categoryTitle);
      } else {
        newSet.add(categoryTitle);
      }
      return newSet;
    });
  }, []);

  // When sidebar is collapsed, show category icons as individual buttons
  if (state === "collapsed") {
    return (
      <SidebarGroup {...props}>
        <SidebarGroupContent>
          <SidebarMenu>
            {groups.map((group) => {
              // Use the first item as the primary item for each category
              const primaryItem = group.items[0];
              if (!primaryItem) return null;

              const isActive = group.items.some(item => pathname === item.url);

              return (
                <SidebarMenuItem key={group.title}>
                  <SidebarMenuButton asChild tooltip={group.title} isActive={isActive}>
                    <Link
                      href={primaryItem.url}
                      className={cn(
                        isActive && "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      <group.icon className="shrink-0" />
                      <span className="group-data-[collapsible=icon]:sr-only">{group.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  // When sidebar is expanded, show collapsible groups
  return (
    <>
      {groups.map((group) => {
        const isCategoryCollapsed = collapsedCategories.has(group.title);

        return (
          <Collapsible
            key={group.title}
            open={!isCategoryCollapsed}
            onOpenChange={() => toggleCategory(group.title)}
          >
            <SidebarGroup {...props}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="group/collapsible-trigger cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors">
                  <span className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      <group.icon className="h-4 w-4 shrink-0" />
                      <span>{group.title}</span>
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        !isCategoryCollapsed && "rotate-90"
                      )}
                    />
                  </span>
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive = pathname === item.url;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                            <Link
                              href={item.url}
                              className={cn(
                                "pl-6", // Add left padding to align with category icon + text
                                isActive && "bg-accent text-accent-foreground font-medium"
                              )}
                            >
                              <span>{item.title}</span>
                              {item.badge && (
                                <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        );
      })}
    </>
  );
}

// Legacy component for backward compatibility
export function NavTopLegacy({
  items,
  ...props
}: {
  items: NavigationItem[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link
                    href={item.url}
                    className={cn(
                      isActive && "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
