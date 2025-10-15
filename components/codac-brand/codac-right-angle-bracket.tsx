'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { cn } from '@/lib/utils';

interface CodacRightAngleBracketProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '8xl';
  animated?: boolean;
}

const sizeConfig = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
  '2xl': 'w-24 h-24',
  '4xl': 'w-32 h-32',
  '6xl': 'w-48 h-48',
  '8xl': 'w-96 h-96',
};

export const CodacRightAngleBracket: React.FC<CodacRightAngleBracketProps> = ({
  className,
  size = 'sm',
  animated = false,
}) => {
  const SvgComponent = (
    <svg
      viewBox='0 0 335 670'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(sizeConfig[size], className)}
    >
      <g
        id='right-angle-bracket'
        className={animated ? 'animate-diamond-pulse' : ''}
        style={{ animationDelay: '1s' }}
      >
        <path
          d='M0 668.923L167.462 334.461L0 0L334.462 334.461L0 668.923Z'
          fill='url(#right-angle-gradient)'
        />
        <path
          d='M0 0L167.462 334.461L0 668.923M0 0L334.462 334.461L0 668.923'
          stroke='white'
          strokeWidth='15'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <linearGradient
          id='right-angle-gradient'
          x1='167.231'
          y1='668.923'
          x2='167.231'
          y2='0'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#E77096' />
          <stop offset='1' stopColor='#52EACE' />
        </linearGradient>
      </defs>
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
      >
        {SvgComponent}
      </motion.div>
    );
  }

  return SvgComponent;
};

export default CodacRightAngleBracket;
