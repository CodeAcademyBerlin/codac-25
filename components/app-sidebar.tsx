'use client';

import * as React from 'react';
import {
  Book,
  BarChart3,
  Users,
  MessageSquare,
  User,
  Calendar,
  Trophy,
  HelpCircle,
  Settings,
  Search,
  Briefcase,
  Heart,
  Star,
  GraduationCap,
  Brain,
  FileText,
} from 'lucide-react';

import { NavMain } from './nav-main';
import { NavSecondary } from './nav-secondary';
import { NavUser } from './nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

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
      title: 'Documents',
      url: '/docs',
      icon: FileText,
      isActive: true,
      // items: [
      //   {
      //     title: 'Documents',
      //     url: '/docs',
      //   },
      // ],
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  <Brain className="!size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-lg">CODAC</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Code Academy Berlin
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.footer} />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
