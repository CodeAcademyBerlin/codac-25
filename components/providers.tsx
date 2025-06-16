'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { SidebarProvider } from './ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { SidebarInset } from './ui/sidebar';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NuqsAdapter>
        <SidebarProvider defaultOpen={true}>

          {children}

        </SidebarProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
