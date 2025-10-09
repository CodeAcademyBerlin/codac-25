'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { CodacLogoShader } from '../hero/codac-logo-shader';

interface ShaderLandingContentProps {
  className?: string;
  variant?: 'simple' | 'advanced';
  interactive?: boolean;
}

export function ShaderLandingContent({
  className,
  variant = 'advanced',
  interactive = false,
}: ShaderLandingContentProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        'flex flex-col justify-center items-center h-full w-full',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className='w-full h-full max-w-4xl'
      >
        {/* <SingularityShaders className='w-full h-full' /> */}
        <CodacLogoShader />
        {/* <CodacShaderLandingLogo /> */}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className='mt-8 text-center'
      >
        <h2 className='text-2xl font-codac-brand uppercase tracking-wider text-white'>
          The future of coding education
        </h2>
        <p className='mt-2 text-white/80'>Click anywhere to continue</p>
      </motion.div>
    </div>
  );
}

export default ShaderLandingContent;
