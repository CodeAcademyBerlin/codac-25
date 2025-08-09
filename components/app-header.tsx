import { SidebarTrigger } from "@/components/ui/sidebar"

interface AppHeaderProps {
    showSidebarTrigger?: boolean
}

export function AppHeader({
    showSidebarTrigger = true
}: AppHeaderProps) {
    return (
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            {showSidebarTrigger && (
                <SidebarTrigger className="-ml-1" />
            )}
        </header>
    )
} 