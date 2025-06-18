'use client';

import {
  Book,
  BarChart3,
  Users,
  MessageSquare,
  Calendar,
  Trophy,
  HelpCircle,
  Settings,
  Search,
  Briefcase,
  GraduationCap,
  FileText,
  Pyramid,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { NavMain } from './nav-main';
import { NavSecondary } from './nav-secondary';
import { NavUser } from './nav-user';

const data = {
  user: {
    name: 'Alex Müller',
    email: 'alex.mueller@student.codeacademyberlin.com',
    avatar: '/avatars/student-1.jpg',
    role: 'Web Development Student',
    cohort: '2024-Web-Dev-Bootcamp',
  },
  navMain: [

    {
      title: 'Dashboard',
      url: '/',
      icon: BarChart3,
      isActive: false,
      items: [
        {
          title: 'Overview',
          url: '/dashboard',
        },
        {
          title: 'Progress',
          url: '/dashboard/progress',
        },
        {
          title: 'Achievements',
          url: '/dashboard/achievements',
        },
      ],
    },
    {
      title: 'My Learning',
      url: '/learning',
      icon: Book,
      items: [
        {
          title: 'Current Courses',
          url: '/learning/courses',
        },
        {
          title: 'Assignments',
          url: '/learning/assignments',
        },
        {
          title: 'Resources',
          url: '/learning/resources',
        },
        {
          title: 'Notes',
          url: '/learning/notes',
        },
      ],
    },
    {
      title: 'Community',
      url: '/community',
      icon: Users,
      items: [
        {
          title: 'Discussions',
          url: '/community/discussions',
        },
        {
          title: 'Showcase',
          url: '/community/showcase',
        },
        {
          title: 'Events',
          url: '/community/events',
        },
        {
          title: 'Study Groups',
          url: '/community/groups',
        },
      ],
    },
    {
      title: 'Career Center',
      url: '/career',
      icon: Briefcase,
      items: [
        {
          title: 'Job Board',
          url: '/career/jobs',
        },
        {
          title: 'Alumni Network',
          url: '/career/alumni',
        },
        {
          title: 'Portfolio',
          url: '/career/portfolio',
        },
        {
          title: 'Interview Prep',
          url: '/career/interview-prep',
        },
      ],
    },
    {
      title: 'Mentorship',
      url: '/mentorship',
      icon: GraduationCap,
      items: [
        {
          title: 'Find a Mentor',
          url: '/mentorship/find',
        },
        {
          title: 'My Mentors',
          url: '/mentorship/my-mentors',
        },
        {
          title: 'Become a Mentor',
          url: '/mentorship/become-mentor',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Documents',
      url: '/docs',
      icon: FileText,
    },
    {
      title: 'Messages',
      url: '/messages',
      icon: MessageSquare,
      badge: '3',
    },
    {
      title: 'Calendar',
      url: '/calendar',
      icon: Calendar,
    },
    {
      title: 'Achievements',
      url: '/achievements',
      icon: Trophy,
    },
    {
      title: 'Search',
      url: '/search',
      icon: Search,
    },
  ],
  footer: [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    },
    {
      title: 'Help & Support',
      url: '/help',
      icon: HelpCircle,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <div className="sm:flex-nowrap flex h-8 w-8 items-center justify-center rounded-sm bg-gradient-to-br from-gray-600 to-purple-600 text-white">
                  <Pyramid className="!size-5" />
                </div>
                <div className=" flex-1 text-left text-sm hidden sm:grid leading-tight">
                  <span className="truncate font-semibold  text-2xl ">codac </span>
                  {/* <span className="truncate text-xs text-muted-foreground">
                    community
                  </span> */}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {/* <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-xs text-muted-foreground">Customize</span>
          <ThemePicker variant="popover" align="end" />
        </div> */}
        <NavSecondary items={data.footer} />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
