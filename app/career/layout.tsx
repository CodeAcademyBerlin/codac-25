import { ReactNode } from 'react'

import { Separator } from '@/components/ui/separator'

interface CareerLayoutProps {
  children: ReactNode
}

export default function CareerLayout({ children }: CareerLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto py-4">
          <nav className="flex items-center space-x-6">
            <h2 className="text-lg font-semibold">Career Center</h2>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex space-x-6">
              <a 
                href="/career/jobs" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Job Board
              </a>
              <a 
                href="/career/resources" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Resources
              </a>
              <a 
                href="/career/events" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Events
              </a>
            </div>
          </nav>
        </div>
      </div>
      {children}
    </div>
  )
} 