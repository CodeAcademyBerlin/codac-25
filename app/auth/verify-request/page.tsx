import { Mail } from 'lucide-react';
import Link from 'next/link';

import { CodacLogo } from '@/components/codac-brand/codac-logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function VerifyRequestPage() {
  return (
    <div className='flex items-center justify-center min-h-screen p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1 text-center'>
          <div className='flex justify-center mb-4'>
            <CodacLogo size="lg" useGradient />
          </div>
          <CardTitle className='text-2xl font-bold'>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a sign-in link to your email address. Click the link
            in the email to sign in to your CODAC account.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='text-sm text-muted-foreground text-center'>
            <p>
              Didn&apos;t receive the email? Check your spam folder or try
              signing in again.
            </p>
          </div>
          <Button asChild className='w-full' variant='outline'>
            <Link href='/auth/signin'>Back to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
