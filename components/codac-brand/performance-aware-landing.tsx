'use client';

import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useIsTouchDevice } from '@/hooks/use-is-touch-device';

import { AnimatedLandingContent } from './animated-landing-content';
import { ShaderLandingContent } from './shader-landing-content';

interface PerformanceAwareLandingProps {
  className?: string;
  fallbackToSimple?: boolean;
}

export function PerformanceAwareLanding({
  className,
  fallbackToSimple = false,
}: PerformanceAwareLandingProps) {
  const [canUseAdvanced, setCanUseAdvanced] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isTouchDevice = useIsTouchDevice();

  useEffect(() => {
    // Check if the device can handle WebGL and 3D rendering
    const checkPerformance = () => {
      try {
        // Check for WebGL support
        const canvas = document.createElement('canvas');
        const gl =
          canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
          return false;
        }

        // Check device memory if available
        const memory = (navigator as any).deviceMemory;
        if (memory && memory < 4) {
          return false;
        }

        // Check for mobile devices with lower performance
        if (isTouchDevice && window.innerWidth < 768) {
          return false;
        }

        return true;
      } catch (e) {
        return false;
      }
    };

    setCanUseAdvanced(checkPerformance() && !fallbackToSimple);
    setIsLoaded(true);
  }, [isTouchDevice, fallbackToSimple]);

  if (!isLoaded) {
    // Show a simple loading state while checking performance
    return (
      <div className={className}>
        <div className='flex items-center justify-center h-full'>
          <div className='animate-pulse font-codac-brand text-3xl text-white'>
            CODAC
          </div>
        </div>
      </div>
    );
  }

  // Use the appropriate component based on device capability
  return (
    <div className={className}>
      <ErrorBoundary
        fallbackRender={({ error }) => {
          console.error('Landing component error:', error);
          return <AnimatedLandingContent />;
        }}
      >
        {canUseAdvanced ? (
          <ShaderLandingContent variant='advanced' />
        ) : (
          <AnimatedLandingContent />
        )}
      </ErrorBoundary>
    </div>
  );
}

export default PerformanceAwareLanding;
