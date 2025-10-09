import Link from 'next/link';

import { CodacLogo } from '@/components/codac-brand/codac-logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { BetaSigninStepper } from './beta-signin-stepper';
import { SignInForm } from './signin-form';

interface BetaSigninPageProps {
  callbackUrl?: string;
  verifiedEmail?: string;
}

export function BetaSigninPage({
  callbackUrl,
  verifiedEmail,
}: BetaSigninPageProps) {
  // If email is verified, show the sign-in form
  if (verifiedEmail) {
    return (
      <Card className='w-full p-4'>
        <CardHeader className='space-y-1'>
          <div className='flex justify-center mb-4'>
            <CodacLogo size='lg' useGradient />
          </div>
          <CardTitle className='text-2xl font-bold text-center font-codac-brand uppercase'>
            sign in
          </CardTitle>
          <CardDescription className='text-center'>
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm callbackUrl={callbackUrl} verifiedEmail={verifiedEmail} />
          <div className='mt-4 text-center'>
            <Link
              href='/auth/signin'
              className='text-sm text-muted-foreground hover:text-primary hover:underline'
            >
              ← Back to alumni verification
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show the alumni verification stepper
  return (
    <Card className='w-full p-4'>
      <CardHeader className='space-y-1'>
        <div className='flex justify-center mb-4'>
          <CodacLogo size='lg' useGradient />
        </div>
        <CardTitle className='text-2xl font-bold text-center font-codac-brand uppercase'>
          welcome to codac
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BetaSigninStepper callbackUrl={callbackUrl} />
      </CardContent>
    </Card>
  );
}
