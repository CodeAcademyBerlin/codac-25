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
import { NavTop } from "./nav-top";
import { NavUser } from "./nav-user";

const buildNavigationData = (role?: string) => {
  const mentorshipItems = [];

  if (role === "MENTOR" || role === "ADMIN") {
    // Mentors and admins see sessions management
    mentorshipItems.push({
      title: "My Sessions",
      url: "/mentorship/sessions",
      icon: MessageSquare,
    });
  } else {
    // Students see find mentors and their sessions
    mentorshipItems.push(
      {
        title: "Find Mentors",
        url: "/mentorship/find",
        icon: MessageSquare,
      },
      {
        title: "My Sessions",
        url: "/mentorship/my-mentors",
        icon: MessageSquare,
      }
    );
  }

  return {
    navTop: [
      {
        title: "Dashboard",
        url: "/",
        icon: BarChart3,
        isActive: false,
      },
      {
        title: "Learning",
        url: "/learning",
        icon: Book,
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
        title: "Career Center",
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
        <NavTop items={navData.navTop} />
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={navData.footer} />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
