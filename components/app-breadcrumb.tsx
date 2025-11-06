'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    href?: string;
  };
}

const ROUTE_CONFIG: BreadcrumbConfig = {
  '/': { label: 'Home', href: '/' },
  '/dashboard': { label: 'Dashboard', href: '/dashboard' },
  '/showcase': { label: 'Showcase', href: '/showcase' },
  '/lms': { label: 'Learning', href: '/lms' },
  '/lms/[id]': { label: 'Course', href: '/lms/[id]' },
  '/lms/[id]/edit': { label: 'Edit Course', href: '/lms/[id]/edit' },
  '/community': { label: 'Community', href: '/community' },
  '/community/cohorts': { label: 'Cohorts', href: '/community/cohorts' },
  '/community/cohorts/[slug]': { label: 'Cohort', href: '/community/cohorts/[slug]' },
  '/community/students': { label: 'Students', href: '/community/students' },
  '/community/mentors': {
    label: 'Mentors',
    href: '/community/mentors',
  },
  '/community/alumni': {
    label: 'Alumni',
    href: '/community/alumni',
  },
  '/community/[userRole]': { label: 'Community', href: '/community/[userRole]' },
  '/community/[userRole]/[userId]': { label: 'Profile', href: '/community/[userRole]/[userId]' },
  '/projects': { label: 'Projects', href: '/projects' },
  '/projects/my': { label: 'My Projects', href: '/projects/my' },
  '/projects/create': { label: 'Create Project', href: '/projects/create' },
  '/projects/[username]/[projectSlug]': {
    label: 'Project',
    href: '/projects/[username]/[projectSlug]',
  },
  '/projects/[username]/[projectSlug]/edit': {
    label: 'Edit Project',
    href: '/projects/[username]/[projectSlug]/edit',
  },
  '/career': { label: 'Career Services', href: '/career' },
  '/career/jobs': { label: 'Jobs', href: '/career/jobs' },
  '/career/jobs/[id]': { label: 'Job', href: '/career/jobs/[id]' },
  '/career/jobs/post': { label: 'Post Job', href: '/career/jobs/post' },
  '/attendance': { label: 'Attendance', href: '/attendance' },
  '/attendance/[cohortSlug]': { label: 'Cohort Attendance', href: '/attendance/[cohortSlug]' },
  '/mentorship': { label: 'Mentorship', href: '/mentorship' },
  '/profile': { label: 'Profile', href: '/profile' },
  '/settings': { label: 'Settings', href: '/settings' },
  '/profile/settings': { label: 'Settings', href: '/profile/settings' },
  '/documents': { label: 'Documents', href: '/documents' },
  '/documents/[docId]': { label: 'Document', href: '/documents/[docId]' },
  '/chat': { label: 'Chat', href: '/chat' },
};

export function AppBreadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumb for home page
  if (pathname === '/') {
    return null;
  }

  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  const breadcrumbItems: Array<{
    label: string;
    href?: string;
    isLast: boolean;
  }> = [];

  // Build breadcrumb path
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Handle dynamic routes like [id]
    const configKey = currentPath.replace(/\/\[.*?\]/g, '/[id]');
    const config = ROUTE_CONFIG[configKey] ?? ROUTE_CONFIG[currentPath];
    const isLast = index === pathSegments.length - 1;

    if (config) {
      breadcrumbItems.push({
        label: config.label,
        href: !isLast ? config.href : undefined,
        isLast,
      });
    } else {
      // Fallback: capitalize segment and handle dynamic segments
      let label = segment;
      if (segment.startsWith('[') && segment.endsWith(']')) {
        // This is a dynamic segment, use a generic label
        label = 'Details';
      } else {
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      breadcrumbItems.push({
        label,
        href: !isLast ? currentPath : undefined,
        isLast,
      });
    }
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className='max-w-[200px] truncate'>
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={item.href ?? '#'}
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {/* {index === 0 && <BreadcrumbLogo className='h-4 w-4 mr-1 inline' />} */}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
