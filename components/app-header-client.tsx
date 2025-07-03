'use client'

import { usePathname } from 'next/navigation'

import { AppHeader, generateBreadcrumbsFromPath } from './app-header'
import { useHeader } from './header-provider'

interface AppHeaderClientProps {
    customBreadcrumbs?: Array<{
        label: string
        href?: string
    }>
    showThemePicker?: boolean
    showSidebarTrigger?: boolean
}

export function AppHeaderClient({
    customBreadcrumbs,
    showThemePicker = true,
    showSidebarTrigger = true
}: AppHeaderClientProps) {
    const pathname = usePathname()
    const { isHeaderVisible } = useHeader()

    // Use custom breadcrumbs if provided, otherwise generate from path
    const breadcrumbItems = customBreadcrumbs || generateBreadcrumbsFromPath(pathname)

    // Don't render header if it's hidden
    if (!isHeaderVisible) {
        return null
    }

    return (
        <AppHeader
            breadcrumbItems={breadcrumbItems}
            showThemePicker={showThemePicker}
            showSidebarTrigger={showSidebarTrigger}
        />
    )
} 