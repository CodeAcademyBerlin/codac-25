import { SignInForm } from '@/components/auth/signin-form';

interface SignInPageProps {
  searchParams?: Promise<{
    callbackUrl?: string;
    error?: string;
    email?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  return (
    <SignInForm
      callbackUrl={params?.callbackUrl}
      verifiedEmail={params?.email}
    />
  );
}
