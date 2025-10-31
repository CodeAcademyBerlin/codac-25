import Prism from '@/components/prism';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

      <div className='relative z-10'>{children}</div>
    </div>
  );
}
