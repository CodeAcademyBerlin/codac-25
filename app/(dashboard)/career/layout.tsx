import Link from 'next/link'
import { ReactNode } from 'react'

import { HideHeader } from '@/components/hide-header'
import { Separator } from '@/components/ui/separator'

interface CareerLayoutProps {
  children: ReactNode
}

export default function CareerLayout({ children }: CareerLayoutProps) {
  return (
    <div className="flex-1 flex flex-col">
      <HideHeader />
      <div className="border-b">
        <div className="container mx-auto py-4">
          <nav className="flex items-center space-x-6">
            <h2 className="text-lg font-semibold">Career Center</h2>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex space-x-6">
              <Link
                href="/career/jobs"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Job Board
              </Link>
              <Link
                href="/career/resources"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Resources
              </Link>
              <Link
                href="/career/events"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Events
              </Link>
            </div>
          </nav>
        </div>
      </div>
      {children}
    </div>
  )
} 