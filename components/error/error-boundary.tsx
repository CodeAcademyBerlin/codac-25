'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.setState({
      errorInfo,
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to log to a service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Please try again or refresh the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Show Error Details (Development Mode)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">
                      <strong>Error:</strong> {this.state.error.message}
                      {this.state.errorInfo && (
                        <>
                          <br />
                          <br />
                          <strong>Component Stack:</strong>
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </pre>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Async Error Boundary Hook for handling async errors in components
export function useAsyncError() {
  const throwError = (error: Error) => {
    // This will trigger the nearest error boundary
    throw error;
  };

  return { throwError };
}