'use client';

import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Github,
  Link as LinkIcon,
  RefreshCw,
  Unlink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  checkGitHubConnection,
  getGitHubUserInfo,
} from '@/actions/github/github-actions';
import { unlinkGitHubAccount } from '@/actions/github/unlink-github';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface GitHubIntegrationCardProps {
  className?: string;
}

export function GitHubIntegrationCard({
  className,
}: GitHubIntegrationCardProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [gitHubUser, setGitHubUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connectionResult = await checkGitHubConnection();
        setIsConnected(connectionResult.success && connectionResult.data);

        if (connectionResult.success && connectionResult.data) {
          // Fetch GitHub user info if connected
          try {
            const userResult = await getGitHubUserInfo();
            if (userResult.success && userResult.data) {
              setGitHubUser(userResult.data);
            }
          } catch (error) {
            console.error('Error fetching GitHub user:', error);
          }
        }
      } catch (error) {
        console.error('Error checking GitHub connection:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const refreshConnection = async () => {
    setIsRefreshing(true);
    try {
      const connectionResult = await checkGitHubConnection();
      setIsConnected(connectionResult.success && connectionResult.data);

      if (connectionResult.success && connectionResult.data) {
        const userResult = await getGitHubUserInfo();
        if (userResult.success && userResult.data) {
          setGitHubUser(userResult.data);
        }
      } else {
        setGitHubUser(null);
      }
      toast.success('Connection status refreshed');
    } catch (error) {
      console.error('Error refreshing connection:', error);
      toast.error('Failed to refresh connection status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUnlinkGitHub = async () => {
    setIsUnlinking(true);
    try {
      const result = await unlinkGitHubAccount();

      if (result.success) {
        toast.success('GitHub account unlinked successfully');
        setIsConnected(false);
        setGitHubUser(null);
      } else {
        toast.error('Failed to unlink GitHub account');
      }
    } catch (error) {
      console.error('Error unlinking GitHub:', error);
      toast.error('Failed to unlink GitHub account');
    } finally {
      setIsUnlinking(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Github className='h-5 w-5' />
            GitHub Integration
          </CardTitle>
          <CardDescription>
            Manage your GitHub account connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-3'>
            <div className='h-4 bg-muted rounded w-3/4'></div>
            <div className='h-4 bg-muted rounded w-1/2'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Github className='h-5 w-5' />
          GitHub Integration
        </CardTitle>
        <CardDescription>
          Connect your GitHub account to import repositories as projects
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isConnected ? (
          <>
            {/* Connected State */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Badge variant='default' className='flex items-center gap-1'>
                  <CheckCircle className='h-3 w-3' />
                  Connected
                </Badge>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={refreshConnection}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleUnlinkGitHub}
                  disabled={isUnlinking}
                >
                  {isUnlinking ? (
                    <AlertCircle className='h-3 w-3 mr-1 animate-spin' />
                  ) : (
                    <Unlink className='h-3 w-3 mr-1' />
                  )}
                  Unlink
                </Button>
              </div>
            </div>

            {gitHubUser && (
              <>
                <Separator />
                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <Image
                      src={gitHubUser.avatar_url}
                      alt={gitHubUser.name || gitHubUser.login}
                      className='h-10 w-10 rounded-full'
                    />
                    <div>
                      <p className='font-medium'>
                        {gitHubUser.name || gitHubUser.login}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        @{gitHubUser.login}
                      </p>
                    </div>
                  </div>

                  {gitHubUser.bio && (
                    <p className='text-sm text-muted-foreground'>
                      {gitHubUser.bio}
                    </p>
                  )}

                  <div className='flex gap-4 text-sm text-muted-foreground'>
                    <span>{gitHubUser.public_repos} repositories</span>
                    <span>{gitHubUser.followers} followers</span>
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    asChild
                    className='w-full'
                  >
                    <a
                      href={gitHubUser.html_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2'
                    >
                      <ExternalLink className='h-3 w-3' />
                      View GitHub Profile
                    </a>
                  </Button>
                </div>
              </>
            )}

            <Alert>
              <CheckCircle className='h-4 w-4' />
              <AlertDescription>
                Your GitHub account is connected. You can now import
                repositories as projects and access your private repositories
                (with permission).
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <>
            {/* Not Connected State */}
            <div className='flex items-center justify-between'>
              <Badge variant='secondary' className='flex items-center gap-1'>
                <AlertCircle className='h-3 w-3' />
                Not Connected
              </Badge>
            </div>

            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Connect your GitHub account to import repositories as projects
                and showcase your work.
              </AlertDescription>
            </Alert>

            <Button asChild className='w-full'>
              <Link
                href='/api/sign-in/github'
                className='flex items-center gap-2'
              >
                <LinkIcon className='h-4 w-4' />
                Connect GitHub Account
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
