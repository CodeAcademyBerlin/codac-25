'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  signInWithCredentials,
  signInWithMagicLink,
  signInWithOAuth,
} from '@/actions/auth/signin';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CodacLogo from '../codac-brand/codac-logo';
import { Separator } from '../ui/separator';

interface SignInFormProps {
  callbackUrl?: string;
  verifiedEmail?: string;
  providers?: {
    google?: boolean;
    github?: boolean;
    resend?: boolean;
    credentials?: boolean;
  };
}

function getErrorMessage(error: string | undefined): string {
  switch (error) {
    case 'CredentialsSignin':
      return 'Sign in failed. Check the details you provided are correct.';
    case 'SessionRequired':
      return 'Please sign in to access this page.';
    case 'EmailSignin':
      return 'Failed to send email. Please try again.';
    default:
      return 'An error occurred during sign in.';
  }
}

export function SignInForm({
  callbackUrl: initialCallbackUrl,
  verifiedEmail,
  providers = {
    google: false,
    github: false,
    resend: false,
    credentials: true,
  },
}: SignInFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [email, setEmail] = useState(verifiedEmail || '');
  const [password, setPassword] = useState('');
  const [magicEmail, setMagicEmail] = useState(verifiedEmail || '');
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Get parameters from URL
  const callbackUrl =
    initialCallbackUrl || searchParams.get('callbackUrl') || '/';
  const urlError = searchParams.get('error');
  const [error, setError] = useState<string | undefined>(urlError || undefined);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  // Update error state when URL error changes
  useEffect(() => {
    if (urlError) {
      setError(urlError);
    }
  }, [urlError]);

  const handleCredentialsSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsCredentialsLoading(true);
    setError(undefined);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('callbackUrl', callbackUrl);

      const result = await signInWithCredentials(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push(result.redirectUrl || callbackUrl);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred during sign in.';
      setError(errorMessage);
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!magicEmail) {
      setError('Email is required');
      return;
    }

    setIsMagicLinkLoading(true);
    setError(undefined);

    try {
      const formData = new FormData();
      formData.append('email', magicEmail);
      formData.append('callbackUrl', callbackUrl);

      const result = await signInWithMagicLink(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setMagicLinkSent(true);
        // Redirect to verify-request page after a short delay
        setTimeout(() => {
          router.push(result.redirectUrl || '/auth/verify-request');
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while sending the magic link.';
      setError(errorMessage);
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsOAuthLoading(provider);
    setError(undefined);
    try {
      await signInWithOAuth(provider, callbackUrl);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'OAuth sign-in failed.';
      setError(errorMessage);
    } finally {
      setIsOAuthLoading(null);
    }
  };

  // Show loading while checking authentication status
  if (status === 'loading') {
    return (
      <div className='flex justify-center items-center py-8'>
        <Icons.spinner className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <Card className='bg-background/50'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <CodacLogo size='lg' useGradient />
          </div>
          <CardDescription>
            <span className='text-2xl font-bold text-center font-codac-brand uppercase'>
              sign in
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
          )}
          {/* OAuth Buttons */}
          {(providers.google || providers.github) && (
            <div className='space-y-2'>
              {providers.google && (
                <Button
                  type='button'
                  className='w-full'
                  variant='outline'
                  onClick={() => handleOAuth('google')}
                  disabled={isOAuthLoading === 'google'}
                >
                  {isOAuthLoading === 'google' ? (
                    <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Icons.google className='mr-2 h-4 w-4' />
                  )}
                  Continue with Google
                </Button>
              )}
              {providers.github && (
                <Button
                  type='button'
                  className='w-full'
                  variant='outline'
                  onClick={() => handleOAuth('github')}
                  disabled={isOAuthLoading === 'github'}
                >
                  {isOAuthLoading === 'github' ? (
                    <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Icons.gitHub className='mr-2 h-4 w-4' />
                  )}
                  Continue with GitHub
                </Button>
              )}
            </div>
          )}
          {/* Credentials Form */}
          {providers.credentials !== false && (
            <form onSubmit={handleCredentialsSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='Enter your email address'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isCredentialsLoading}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  placeholder='Enter your password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isCredentialsLoading}
                />
              </div>
              <Button
                type='submit'
                className='w-full'
                disabled={isCredentialsLoading}
              >
                {isCredentialsLoading && (
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                )}
                Sign In
              </Button>
            </form>
          )}

          <Separator />
          <div className='text-center'>
            <span className='text-sm text-muted-foreground'>
              don't have an account?{' '}
              <a href='/auth/signup' className='text-primary hover:underline'>
                sign up
              </a>
            </span>
          </div>
          {/* Forgot Password Link */}
          <div className='text-center'>
            <a
              href='/auth/forgot-password'
              className='text-sm text-muted-foreground hover:text-primary hover:underline'
            >
              Forgot your password?
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
