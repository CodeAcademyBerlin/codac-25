'use client';


import { Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ErrorBoundary } from './error-boundary';

type PageErrorBoundaryProps = {
  children: ReactNode;
  pageName?: string;
  showHomeButton?: boolean;
};

export function PageErrorBoundary({ 
  children, 
  pageName = 'page',
  showHomeButton = true 
}: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <CardTitle>Failed to load {pageName}</CardTitle>
              <CardDescription>
                There was an error loading this {pageName}. This might be due to a temporary issue or connection problem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                {showHomeButton && (
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/">
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Link>
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                If this problem continues, please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      }
      onError={(error, errorInfo) => {
        // Enhanced error logging for page-level errors
        console.error(`Page Error in ${pageName}:`, error);
        console.error('Error Info:', errorInfo);
        
        // In production, send to monitoring service
        if (process.env.NODE_ENV === 'production') {
          // Example: analytics.track('Page Error', {
          //   pageName,
          //   error: error.message,
          //   stack: error.stack,
          //   componentStack: errorInfo.componentStack
          // });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}