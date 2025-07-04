import { ThemePicker } from "@/components/theme-picker"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface BreadcrumbItem {
    label: string
    href?: string
}

interface AppHeaderProps {
    title?: string
    breadcrumbItems?: BreadcrumbItem[]
    showThemePicker?: boolean
    showSidebarTrigger?: boolean
}

// Generate breadcrumbs based on the current path
export function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
    const segments = pathname.split('/').filter(Boolean)

    if (segments.length === 0) {
        return [{ label: "Dashboard" }]
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Dashboard", href: "/" }
    ]

    let currentPath = ""

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        currentPath += `/${segment}`

        // Generate human-readable labels
        const label = generateLabelFromSegment(segment, segments, i)

        // Add breadcrumb item
        if (i === segments.length - 1) {
            // Last item should not have href (current page)
            breadcrumbs.push({ label })
        } else {
            breadcrumbs.push({ label, href: currentPath })
        }
    }

    return breadcrumbs
}

function generateLabelFromSegment(segment: string, segments: string[], index: number): string {
    // Handle special cases
    const labelMap: Record<string, string> = {
        'docs': 'Documents',
        'lms': 'Learning Management',
        'career': 'Career Center',
        'jobs': 'Job Board',
        'ducks': 'Secret Ducks',
        'profile': 'Profile',
        'settings': 'Settings',
        'community': 'Community',
        'cohorts': 'Cohorts',
        'courses': 'Courses',
        'lessons': 'Lessons',
        'projects': 'Projects',
        'admin': 'Administration',
        'enrollments': 'Enrollments',
        'auth': 'Authentication',
        'signin': 'Sign In',
        'signup': 'Sign Up',
        'signout': 'Sign Out',
        'error': 'Error',
        'verify-request': 'Verify Request',
        'upload': 'Upload',
        'post': 'Post',
        'edit': 'Edit',
        'create': 'Create',
        'learning': 'Learning Paths'
    }

    // Check if it's a dynamic route (UUID-like or numeric)
    if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        // Look at the parent segment to determine context
        const parentSegment = index > 0 ? segments[index - 1] : ''
        switch (parentSegment) {
            case 'docs':
                return 'Document'
            case 'jobs':
                return 'Job Details'
            case 'courses':
                return 'Course'
            case 'lessons':
                return 'Lesson'
            case 'ducks':
                return 'Duck'
            default:
                return 'Details'
        }
    }

    // Check if it's a numeric ID
    if (segment.match(/^\d+$/)) {
        const parentSegment = index > 0 ? segments[index - 1] : ''
        return `${labelMap[parentSegment] || capitalizeFirst(parentSegment)} #${segment}`
    }

    // Return mapped label or capitalize the segment
    return labelMap[segment] || capitalizeFirst(segment.replace(/-/g, ' '))
}

function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function AppHeader({
    breadcrumbItems,
    showThemePicker = true,
    showSidebarTrigger = true
}: AppHeaderProps) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            {showSidebarTrigger && (
                <>
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                </>
            )}
            {breadcrumbItems && breadcrumbItems.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbItems.map((item, index) => (
                            <div key={`${item.label}-${index}`} className="flex items-center">
                                {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                                <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                                    {item.href ? (
                                        <BreadcrumbLink href={item.href}>
                                            {item.label}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                            </div>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
            {showThemePicker && (
                <div className="ml-auto">
                    <ThemePicker variant="dropdown" align="end" />
                </div>
            )}
        </header>
    )
} 