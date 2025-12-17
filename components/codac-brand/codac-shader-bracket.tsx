'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { cn } from '@/lib/utils';

interface CodacShaderBracketProps {
  /**
   * Which side bracket to render
   */
  side: 'left' | 'right';

  /**
   * Size variant for the bracket
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '8xl';

  /**
   * Whether to animate the bracket on mount
   */
  animated?: boolean;

  /**
   * Whether to use the shader effect
   */
  useShader?: boolean;

  /**
   * Shader intensity (default: 1.2)
   */
  shaderIntensity?: number;

  /**
   * Shader animation speed (default: 0.5)
   */
  shaderSpeed?: number;

  /**
   * Custom className for additional styling
   */
  className?: string;
}

const sizeConfig = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
  '2xl': 'w-24 h-24',
  '8xl': 'w-96 h-96',
};

export const CodacShaderBracket: React.FC<CodacShaderBracketProps> = ({
  side,
  size = 'sm',
  animated = false,
  useShader = true,
  shaderIntensity = 1.2,
  shaderSpeed = 0.5,
  className,
}) => {
  const isLeft = side === 'left';

  const SvgComponent = (
    <svg
      viewBox={isLeft ? '0 0 335 670' : '0 0 335 670'}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(
        sizeConfig[size],
        useShader && 'animate-shader-pulse',
        className
      )}
      style={
        useShader
          ? ({
              '--shader-speed': `${2 / shaderSpeed}s`,
              filter: `drop-shadow(0 0 ${shaderIntensity * 8}px rgba(231, 112, 150, 0.6)) drop-shadow(0 0 ${shaderIntensity * 4}px rgba(82, 234, 206, 0.4))`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <g
        id={isLeft ? 'left-angle-bracket' : 'right-angle-bracket'}
        className={animated ? 'animate-diamond-pulse' : ''}
        style={animated && !isLeft ? { animationDelay: '1s' } : undefined}
      >
        {isLeft ? (
          <>
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
          </>
        ) : (
          <>
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
          </>
        )}
      </g>
      <defs>
        <linearGradient
          id={isLeft ? 'left-angle-gradient' : 'right-angle-gradient'}
          x1={isLeft ? '167' : '167.231'}
          y1='668.923'
          x2={isLeft ? '167' : '167.231'}
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
        initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.8,
          delay: isLeft ? 0.2 : 0.6,
          ease: 'easeOut',
        }}
      >
        {SvgComponent}
      </motion.div>
    );
  }

  return SvgComponent;
};

export default CodacShaderBracket;
