// Dashboard component types

export interface StatCard {
    title: string
    value: string
    change: string
    icon: React.ComponentType<{ className?: string }>
}

export interface ProgressItem {
    name: string
    progress: number
}

export interface Event {
    title: string
    time: string
    icon: React.ComponentType<{ className?: string }>
    iconColor: string
}

export interface Activity {
    id: string
    avatar: string
    name: string
    action: string
    time: string
    badge?: {
        text: string
        variant: "default" | "secondary" | "destructive" | "outline"
    }
}

export interface DashboardHeaderProps {
    title?: string
    breadcrumbItems?: Array<{
        label: string
        href?: string
    }>
} 