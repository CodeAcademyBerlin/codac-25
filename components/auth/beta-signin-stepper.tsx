'use client';

import { CheckCircle, Loader2, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { checkAlumniStatus } from '@/actions/auth/check-alumni';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { WaitlistForm } from './waitlist-form';

interface BetaSigninStepperProps {
  callbackUrl?: string;
}

type Step = 'email' | 'verification' | 'waitlist';

export function BetaSigninStepper({ callbackUrl }: BetaSigninStepperProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      // Check if user is alumni using server action
      const result = await checkAlumniStatus(email);

      if (result.isAlumni) {
        handleAlumniSignIn();
      } else {
        setCurrentStep('waitlist');
        toast.info(
          result.message ||
            'You are not currently registered as a Code Academy Berlin alumni.'
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlumniSignIn = () => {
    const params = new URLSearchParams();
    params.set('email', email);
    if (callbackUrl) {
      params.set('callbackUrl', callbackUrl);
    }
    router.push(`/auth/signin?${params.toString()}`);
  };

  const resetToEmail = () => {
    setCurrentStep('email');
    setEmail('');
  };

  if (currentStep === 'verification') {
    return (
      <Card className='w-full max-w-md'>
        <CardContent className='space-y-4'>
          <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
            <div className='flex items-center space-x-2'>
              <CheckCircle className='h-5 w-5 text-green-600' />
              <span className='text-sm font-medium text-green-900 dark:text-green-100'>
                Alumni Status Verified
              </span>
            </div>
            <p className='mt-2 text-sm text-green-700 dark:text-green-300'>
              Email: <strong>{email}</strong>
            </p>
          </div>

          <div className='space-y-3'>
            <Button onClick={handleAlumniSignIn} className='w-full'>
              <LogIn className='mr-2 h-4 w-4' />
              Sign In to Platform
            </Button>

            <Button variant='outline' onClick={resetToEmail} className='w-full'>
              Use Different Email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'waitlist') {
    return <WaitlistForm email={email} onBack={resetToEmail} />;
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='text-center'>
        <CardDescription>
          Enter your email address to check your alumni status and access the
          platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email Address</Label>
            <Input
              id='email'
              type='email'
              placeholder='your.email@example.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <p className='text-xs text-muted-foreground'>
              We&apos;ll check if you&apos;re a Code Academy Berlin alumni
            </p>
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Check Email
          </Button>
        </form>

        <div className='mt-6'>
          <Separator className='my-4' />
          <div className='text-center'>
            <Badge variant='secondary' className='mb-2'>
              Beta Phase
            </Badge>
            <p className='text-xs text-muted-foreground'>
              Access is currently limited to Code Academy Berlin alumni only
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
