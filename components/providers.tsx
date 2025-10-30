'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

import { SidebarProvider } from './ui/sidebar';
import { HeaderProvider } from './header-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}
