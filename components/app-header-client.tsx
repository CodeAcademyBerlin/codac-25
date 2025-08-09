'use client'

import { AppHeader } from './app-header'
import { useHeader } from './header-provider'

interface AppHeaderClientProps {
    showSidebarTrigger?: boolean
}

export function AppHeaderClient({
    showSidebarTrigger = true
}: AppHeaderClientProps) {
    const { isHeaderVisible } = useHeader()

    // Don't render header if it's hidden
    if (!isHeaderVisible) {
        return null
    }

    return (
        <AppHeader
            showSidebarTrigger={showSidebarTrigger}
        />
    )
} 