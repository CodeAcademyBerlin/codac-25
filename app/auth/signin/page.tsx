import { BetaSigninPage } from '@/components/auth/beta-signin-page';

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
    <BetaSigninPage
      callbackUrl={params?.callbackUrl}
      verifiedEmail={params?.email}
    />
  );
}
