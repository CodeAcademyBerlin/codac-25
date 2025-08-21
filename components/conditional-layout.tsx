'use client'

import { usePathname } from 'next/navigation'

import { AppHeaderClient } from '@/components/app-header-client'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

// Routes that should NOT have the dashboard layout (sidebar + header)
const AUTH_ROUTES = ['/auth']

function shouldShowDashboardLayout(pathname: string): boolean {
  return !AUTH_ROUTES.some(route => pathname.startsWith(route))
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const showDashboard = shouldShowDashboardLayout(pathname)

  if (!showDashboard) {
    // For auth pages, render children without dashboard layout
    return <>{children}</>
  }

  // For dashboard pages, render with sidebar and header
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeaderClient />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}