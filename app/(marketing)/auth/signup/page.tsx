import { SignUpForm } from '@/components/auth/signup-form';

interface SignUpPageProps {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || '/';

  return <SignUpForm callbackUrl={callbackUrl} />;
}
