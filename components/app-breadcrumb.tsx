'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    Breadcrumb,
    BreadcrumbItem,
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
    '/': { label: 'Dashboard', href: '/' },
    '/lms': { label: 'Learning Management', href: '/lms' },
    '/learning': { label: 'Learning', href: '/learning' },
    '/community': { label: 'Community', href: '/community' },
    '/career': { label: 'Career Services', href: '/career' },
    '/career/jobs': { label: 'Job Board', href: '/career/jobs' },
    '/mentorship': { label: 'Mentorship', href: '/mentorship' },
    '/docs': { label: 'Documentation', href: '/docs' },
    '/profile': { label: 'Profile', href: '/profile' },
    '/profile/settings': { label: 'Settings' },
};

export function AppBreadcrumb() {
    const pathname = usePathname();
    
    // Don't show breadcrumb for home page
    if (pathname === '/') {
        return null;
    }

    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    const breadcrumbItems: Array<{ label: string; href?: string; isLast: boolean }> = [];

    // Always start with home
    breadcrumbItems.push({
        label: 'Dashboard',
        href: '/',
        isLast: false
    });

    // Build breadcrumb path
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const config = ROUTE_CONFIG[currentPath];
        const isLast = index === pathSegments.length - 1;

        if (config) {
            breadcrumbItems.push({
                label: config.label,
                href: !isLast ? config.href : undefined,
                isLast
            });
        } else {
            // Fallback: capitalize segment
            breadcrumbItems.push({
                label: segment.charAt(0).toUpperCase() + segment.slice(1),
                isLast
            });
        }
    });

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <BreadcrumbItem>
                            {item.isLast ? (
                                <BreadcrumbPage className="max-w-[200px] truncate">
                                    {item.label}
                                </BreadcrumbPage>
                            ) : (
                                <Link 
                                    href={item.href || '#'} 
                                    className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {index === 0 && <Home className="h-4 w-4 mr-1" />}
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </BreadcrumbItem>
                        {!item.isLast && (
                            <BreadcrumbSeparator>
                                <ChevronRight className="h-4 w-4" />
                            </BreadcrumbSeparator>
                        )}
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}