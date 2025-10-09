import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Reset your password
          </h1>
          <p className='mt-2 text-sm text-gray-600'>
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
