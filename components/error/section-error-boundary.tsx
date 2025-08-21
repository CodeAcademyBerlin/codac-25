'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { ReactNode } from 'react';


import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import { ErrorBoundary } from './error-boundary';

type SectionErrorBoundaryProps = {
  children: ReactNode;
  sectionName?: string;
  minimal?: boolean;
};

export function SectionErrorBoundary({ 
  children, 
  sectionName = 'section',
  minimal = false 
}: SectionErrorBoundaryProps) {
  if (minimal) {
    return (
      <ErrorBoundary
        fallback={
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load {sectionName}. Please refresh to try again.
            </AlertDescription>
          </Alert>
        }
      >
        {children}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-destructive mb-1">
                Error loading {sectionName}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                This {sectionName} encountered an error and couldn&apos;t be displayed. 
                You can try refreshing or continue using other parts of the application.
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      }
      onError={(error, _errorInfo) => {
        console.error(`Section Error in ${sectionName}:`, error);
        
        if (process.env.NODE_ENV === 'production') {
          // Track section-level errors with less priority than page errors
          // analytics.track('Section Error', {
          //   sectionName,
          //   error: error.message,
          // });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}