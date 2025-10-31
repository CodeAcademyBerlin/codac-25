'use client';

import { AlertCircle, CheckCircle, ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { checkGitHubConnection } from '@/actions/github/github-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface GitHubConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function GitHubConnectionStatus({
  className,
  showDetails = true,
}: GitHubConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await checkGitHubConnection();
        setIsConnected(result.success && result.data);
      } catch (error) {
        console.error('Error checking GitHub connection:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-5 w-5 rounded-full' />
            <Skeleton className='h-5 w-32' />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-4 w-full' />
        </CardContent>
      </Card>
    );
  }

  if (showDetails) {
    return (
      <Card className={className}>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Github className='h-5 w-5' />
              <CardTitle className='text-base'>GitHub Integration</CardTitle>
            </div>
            <Badge
              variant={isConnected ? 'default' : 'secondary'}
              className='flex items-center gap-1'
            >
              {isConnected ? (
                <>
                  <CheckCircle className='h-3 w-3' />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className='h-3 w-3' />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
          <CardDescription>
            {isConnected
              ? 'Your GitHub account is connected. You can import repositories as projects.'
              : 'Connect your GitHub account to import repositories and create projects.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>
                You can now select repositories from your GitHub account to
                create projects.
              </p>
              <Button variant='outline' size='sm' asChild>
                <Link
                  href='/api/sign-in/github'
                  className='flex items-center gap-2'
                >
                  <ExternalLink className='h-3 w-3' />
                  Manage Connection
                </Link>
              </Button>
            </div>
          ) : (
            <Button asChild className='w-full'>
              <Link
                href='/api/sign-in/github'
                className='flex items-center gap-2'
              >
                <Github className='h-4 w-4' />
                Connect GitHub Account
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Compact version
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Github className='h-4 w-4' />
      <Badge
        variant={isConnected ? 'default' : 'secondary'}
        className='flex items-center gap-1'
      >
        {isConnected ? (
          <>
            <CheckCircle className='h-3 w-3' />
            GitHub Connected
          </>
        ) : (
          <>
            <AlertCircle className='h-3 w-3' />
            GitHub Not Connected
          </>
        )}
      </Badge>
      {!isConnected && (
        <Button variant='outline' size='sm' asChild>
          <Link href='/api/sign-in/github' className='flex items-center gap-1'>
            <ExternalLink className='h-3 w-3' />
            Connect
          </Link>
        </Button>
      )}
    </div>
  );
}
