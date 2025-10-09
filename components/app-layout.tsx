'use client';

import React from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserProfile } from '@/lib/auth/auth-utils';

import { AppHeader } from './app-header';

interface AppLayoutProps {
  children: React.ReactNode;
  userProfile?: UserProfile | null;
}

export function AppLayout({ children, userProfile }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader userProfile={userProfile ?? null} />
        <div className='flex flex-1 flex-col'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
