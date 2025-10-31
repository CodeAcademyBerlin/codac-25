'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

import { SidebarProvider } from './ui/sidebar';
import { HeaderProvider } from './header-provider';

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
      <SidebarProvider defaultOpen={true}>
        <HeaderProvider>
          {children}
        </HeaderProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
