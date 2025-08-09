"use client";

import {
  Home,
  GraduationCap,
  Users,
  Briefcase,
  FileText,
  Pyramid,
  UserCheck,
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

import { NavTop } from "./nav-top";
import { NavUser } from "./nav-user";

const buildNavigationData = (role?: string) => {
  const mentorshipItems = [];

  if (role === "MENTOR" || role === "ADMIN") {
    // Mentors and admins see sessions management
    mentorshipItems.push({
      title: "My Sessions",
      url: "/mentorship/sessions",
      icon: UserCheck,
    });
  } else {
    // Students see find mentors and their sessions
    mentorshipItems.push(
      {
        title: "Find Mentors",
        url: "/mentorship/find",
        icon: UserCheck,
      },
      {
        title: "My Sessions",
        url: "/mentorship/my-mentors",
        icon: UserCheck,
      }
    );
  }

  return {
    navTop: [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
        isActive: false,
      },
      {
        title: "Learning",
        url: "/lms",
        icon: GraduationCap,
      },
      {
        title: "Quizzes",
        url: "/learning/quiz",
        icon: Pyramid,
      },
      {
        title: "Community",
        url: "/community",
        icon: Users,
      },
      {
        title: "Career",
        url: "/career/jobs",
        icon: Briefcase,
      },
      ...mentorshipItems,
    ],
    navSecondary: [
      {
        title: "Documents",
        url: "/docs",
        icon: FileText,
      },
    ],
    footer: [],
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const [navData, setNavData] = React.useState(() =>
    buildNavigationData(undefined)
  );

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
              className="data-[slot=sidebar-menu-button]:!p-2"
            >
              <Link href="/">
                <Image
                  src={"/codac_logo.svg"}
                  alt="codac logo"
                  width={24}
                  height={24}
                  className="shrink-0"
                />
                <div className="flex-1 text-left leading-tight group-data-[collapsible=icon]:group-data-[state=collapsed]:hidden">
                  <span className="font-codac-brand text-2xl uppercase tracking-wider text-primary">
                    codac
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-0">
        <NavTop items={[...navData.navTop, ...navData.navSecondary]} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
