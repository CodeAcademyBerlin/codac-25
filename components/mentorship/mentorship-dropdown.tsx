"use client";

import { ChevronDown, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface MentorshipDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MentorshipDropdown({
  isOpen,
  onToggle,
}: MentorshipDropdownProps) {
  const pathname = usePathname();

  const isActive = pathname.startsWith("/mentorship");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onToggle}
        className={cn(
          "w-full",
          isActive && "bg-accent text-accent-foreground font-medium"
        )}
      >
        <MessageSquare />
        <span>Mentorship</span>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </SidebarMenuButton>
      {isOpen && (
        <SidebarMenuSub>
          <SidebarMenuItem>
            <SidebarMenuSubButton asChild>
              <Link
                href="/mentorship/find"
                className={cn(
                  pathname === "/mentorship/find" &&
                    "bg-accent text-accent-foreground font-medium"
                )}
              >
                <span>Find Mentors</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuSubButton asChild>
              <Link
                href="/mentorship/my-mentors"
                className={cn(
                  pathname === "/mentorship/my-mentors" &&
                    "bg-accent text-accent-foreground font-medium"
                )}
              >
                <span>My Sessions</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuItem>
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}
