import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Suspense } from 'react';

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

function ResetPasswordContent({ token }: { token: string }) {
  if (!token) {
    return (
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl text-red-600'>
            Invalid reset link
          </CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-sm text-muted-foreground mb-4'>
            Please request a new password reset link.
          </p>
          <a
            href='/auth/forgot-password'
            className='text-primary hover:underline'
          >
            Request new reset link
          </a>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>Set new password</h1>
          <p className='mt-2 text-sm text-gray-600'>
            Enter your new password below.
          </p>
        </div>
        <Suspense
          fallback={
            <Card className='w-full max-w-md'>
              <CardContent className='flex items-center justify-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              </CardContent>
            </Card>
          }
        >
          <ResetPasswordContent token={token || ''} />
        </Suspense>
      </div>
    </div>
  );
}
