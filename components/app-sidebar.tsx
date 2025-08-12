"use client";

import {
  Book,
  BarChart3,
  Users,
  Briefcase,
  FileText,
  Pyramid,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { MentorshipDropdown } from "./mentorship/mentorship-dropdown";

interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  isDropdown?: boolean;
  isActive?: boolean;
}

const buildNavigationData = (role?: string) => {
  const mentorshipItems: NavigationItem[] = [];

  if (role === "MENTOR" || role === "ADMIN") {
    // Mentors and admins see sessions management
    mentorshipItems.push({
      title: "My Sessions",
      url: "/mentorship/sessions",
      icon: MessageSquare,
      isDropdown: false,
    });
  } else {
    // Students see mentorship dropdown
    mentorshipItems.push({
      title: "Mentorship",
      url: "/mentorship",
      icon: MessageSquare,
      isDropdown: true,
    });
  }

  return {
    navTop: [
      {
        title: "Dashboard",
        url: "/",
        icon: BarChart3,
        isActive: false,
        isDropdown: false,
      },
      {
        title: "Learning",
        url: "/learning",
        icon: Book,
        isDropdown: false,
      },
      {
        title: "Quizzes",
        url: "/learning/quiz",
        icon: Pyramid,
        isDropdown: false,
      },
      {
        title: "Community",
        url: "/community",
        icon: Users,
        isDropdown: false,
      },
      {
        title: "Career Center",
        url: "/career/jobs",
        icon: Briefcase,
        isDropdown: false,
      },
      ...mentorshipItems,
    ] as NavigationItem[],
    navSecondary: [
      {
        title: "Documents",
        url: "/docs",
        icon: FileText,
        isDropdown: false,
      },
    ] as NavigationItem[],
    footer: [] as NavigationItem[],
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const [navData, setNavData] = React.useState(() =>
    buildNavigationData(undefined)
  );
  const [mentorshipOpen, setMentorshipOpen] = React.useState(false);

  // Update navigation when user role is available
  React.useEffect(() => {
    if (session?.user) {
      const userData = session.user as User;
      setNavData(buildNavigationData(userData.role));
    }
  }, [session]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                {/* <div className="sm:flex-nowrap flex h-8 w-8 items-center justify-center group-data-[collapsible=icon]:group-data-[state=collapsed]:block group-data-[collapsible=icon]:group-data-[state=expanded]:hidden">
                                </div> */}
                <Image
                  src={"/codac_logo.svg"}
                  alt="codac logo"
                  width={32}
                  height={32}
                />

                <div className="flex-1 text-center leading-tight group-data-[collapsible=icon]:group-data-[state=collapsed]:hidden">
                  {/*      <span className="font-codac-brand text-3xl uppercase tracking-wider text-primary">
                                        codac
                                    </span>*/}
                  <span className="font-codac-brand text-3xl uppercase tracking-wider text-primary">
                    codac
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navData.navTop.map((item) => {
            if (item.isDropdown && item.title === "Mentorship") {
              return (
                <MentorshipDropdown
                  key={item.title}
                  isOpen={mentorshipOpen}
                  onToggle={() => setMentorshipOpen(!mentorshipOpen)}
                />
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={navData.footer} />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
