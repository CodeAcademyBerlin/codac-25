import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AnimatedLandingContent } from '@/components/codac-brand/animated-landing-content';
import { getServerSession } from '@/lib/auth/server';

export default async function LandingPage() {
  // Check if user is authenticated and redirect to dashboard
  const session = await getServerSession();
  const user = session?.user;
  console.log('user', user);
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div>
      <Link href='/sign-in'>
        <AnimatedLandingContent />
      </Link>
    </div>
  );
}
