

import { AppHeaderClient } from '@/components/app-header-client'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeaderClient />
        <main className="flex-1 overflow-auto p-3 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}