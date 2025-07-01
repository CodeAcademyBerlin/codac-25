'use client';

import {
    Book,
    BarChart3,
    Users,
    Briefcase,
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

const navigationData = {
    navMain: [
        {
            title: 'Dashboard',
            url: '/',
            icon: BarChart3,
            isActive: false,
        },
        {
            title: 'Learning',
            url: '/learning',
            icon: Book,
            items: [
                {
                    title: 'Learning Overview',
                    url: '/learning',
                },
                {
                    title: 'Web Development',
                    url: '/learning/web',
                },
                {
                    title: 'Data Science',
                    url: '/learning/data',
                },
                {
                    title: 'Career Services',
                    url: '/learning/career',
                },
                {
                    title: 'Course Management',
                    url: '/lms',
                },
            ],
        },
        {
            title: 'Community',
            url: '/community',
            icon: Users,
            items: [
                {
                    title: 'Community Hub',
                    url: '/community',
                },
                {
                    title: 'Cohorts',
                    url: '/community/cohorts',
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
                    title: 'Post a Job',
                    url: '/career/jobs/post',
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
    ],
    footer: [],
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
                            <Link href="/">
                                <div className="sm:flex-nowrap flex h-8 w-8 items-center justify-center rounded-sm bg-gradient-to-br from-gray-600 to-purple-600 text-white">
                                    <Pyramid className="!size-5" />
                                </div>
                                <div className=" flex-1 text-left text-sm hidden sm:grid leading-tight">
                                    <span className="truncate font-semibold  text-2xl ">codac </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navigationData.navMain} />
                <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavSecondary items={navigationData.footer} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
} 