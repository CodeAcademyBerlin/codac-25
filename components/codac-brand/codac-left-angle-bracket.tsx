'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { cn } from '@/lib/utils';

interface CodacLeftAngleBracketProps {
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

export const CodacLeftAngleBracket: React.FC<CodacLeftAngleBracketProps> = ({
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
        id='left-angle-bracket'
        className={animated ? 'animate-diamond-pulse' : ''}
      >
        <path
          d='M334.461 0L167 334.461L334.461 668.923L0 334.461L334.461 0Z'
          fill='url(#left-angle-gradient)'
        />
        <path
          d='M334.461 0L167 334.461L334.461 668.923M334.461 0L0 334.461L334.461 668.923'
          stroke='white'
          strokeWidth='15'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <linearGradient
          id='left-angle-gradient'
          x1='167'
          y1='668.923'
          x2='167'
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
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      >
        {SvgComponent}
      </motion.div>
    );
  }

  return SvgComponent;
};

export default CodacLeftAngleBracket;
