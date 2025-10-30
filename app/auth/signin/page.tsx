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

  const hasGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)
  const hasGitHub = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET)
  const hasResend = Boolean(process.env.AUTH_RESEND_KEY)

  return (
    <SignInForm
      callbackUrl={params?.callbackUrl}
      verifiedEmail={params?.email}
      providers={{ google: hasGoogle, github: hasGitHub, resend: hasResend, credentials: true }}
    />
  );
}
