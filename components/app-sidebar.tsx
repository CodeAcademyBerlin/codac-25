"use client";

import {
  Users,
  Briefcase,
  Code2,
  LayoutDashboard,
  GraduationCap,
  HandHeart,
  MessageCircle,
  User2,
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
import { NavTop, NavigationGroup } from "./nav-top";
import { NavUser } from "./nav-user";

const buildNavigationData = (role?: string): NavigationGroup[] => {
  // Build mentorship items based on role
  const mentorshipItems = [];
  if (role === "MENTOR" || role === "ADMIN") {
    mentorshipItems.push({
      title: "My Sessions",
      url: "/mentorship/sessions",
    });
  } else {
    mentorshipItems.push(
      {
        title: "Find Mentors",
        url: "/mentorship/find",
      },
      {
        title: "My Sessions",
        url: "/mentorship/my-mentors",
      }
    );
  }

  // Build career items based on role
  const careerItems = [
    {
      title: "Jobs",
      url: "/career/jobs",
    },
    {
      title: "Upload Duck",
      url: "/career/ducks/upload",
    },
  ];

  // Add career admin items for authorized roles
  if (role === "ADMIN" || role === "MENTOR") {
    careerItems.push({
      title: "Post Job",
      url: "/career/jobs/post",
    });
  }

  // Build learning items based on role
  const learningItems = [
    {
      title: "Learning",
      url: "/lms",
    },
    {
      title: "Documents",
      url: "/docs",
    },
    {
      title: "Quizzes",
      url: "/learning/quiz",
    },
  ];

  if (role === "ADMIN") {
    learningItems.push({
      title: "LMS Admin",
      url: "/lms/admin",
    });
  }

  return [
    {
      title: "Overview",
      icon: LayoutDashboard,
      items: [
        {
          title: "Dashboard",
          url: "/",
        },
      ],
    },
    {
      title: "Projects",
      icon: Code2,
      items: [
        {
          title: "My Projects",
          url: "/projects/my",
        },
        {
          title: "Browse Projects",
          url: "/projects",
        },
        {
          title: "Showcase",
          url: "/showcase",
        },
      ],
    },
    {
      title: "Community",
      icon: Users,
      items: [
        {
          title: "Community",
          url: "/community",
        },
        {
          title: "Cohorts",
          url: "/community/cohorts",
        },
      ],
    },
    {
      title: "Career",
      icon: Briefcase,
      items: careerItems,
    },
    {
      title: "Mentorship",
      icon: HandHeart,
      items: mentorshipItems,
    },
    {
      title: "Learning",
      icon: GraduationCap,
      items: learningItems,
    },

  ];
};

const navSecondaryItems = [
  {
    title: "Chat",
    url: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User2,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const [navGroups, setNavGroups] = React.useState(() =>
    buildNavigationData(undefined)
  );

  // Update navigation when user role is available
  React.useEffect(() => {
    if (session?.user) {
      const userData = session.user as User;
      setNavGroups(buildNavigationData(userData.role));
    }
  }, [session]);

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
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
      <SidebarContent className="px-0 flex flex-col">
        <div className="flex-1">
          <NavTop groups={navGroups} />
        </div>
        <div className="mt-auto">
          <NavSecondary items={navSecondaryItems} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
