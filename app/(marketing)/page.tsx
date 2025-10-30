import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AnimatedLandingContent } from '@/components/codac-brand/animated-landing-content';
import Prism from '@/components/prism';
import { getCurrentUser } from '@/lib/auth/auth-utils';

export default async function LandingPage() {
  // Check if user is authenticated and redirect to dashboard
  const user = await getCurrentUser();
  console.log('user', user);
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className='relative flex h-screen w-full items-center justify-center overflow-hidden'>
      {/* Prism background - positioned absolutely behind content */}
      <div className='absolute inset-0 z-0'>
        <Prism
          animationType='3drotate'
          timeScale={0.2}
          height={3}
          baseWidth={5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.1}
          glow={1}
        />
      </div>

      {/* Landing content overlay - positioned above Prism */}
      <Link
        href='/auth/signin'
        className='relative z-10 flex h-full w-full cursor-pointer items-center justify-center transition-colors duration-300 hover:bg-white/5'
      >
        <AnimatedLandingContent />
      </Link>
    </div>
  );
}
