'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { cn } from '@/lib/utils';

import { BracketShader } from './shaders/bracket-shader';

interface CodacShaderBracketProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '8xl';
  animated?: boolean;
  side?: 'left' | 'right';
  useShader?: boolean;
  shaderIntensity?: number;
  shaderSpeed?: number;
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
  className,
  size = 'sm',
  animated = false,
  side = 'left',
  useShader = false,
  shaderIntensity = 1.2,
  shaderSpeed = 0.5,
}) => {
  const isLeft = side === 'left';

  const leftPath = {
    d: 'M334.461 0L167 334.461L334.461 668.923L0 334.461L334.461 0Z',
    stroke:
      'M334.461 0L167 334.461L334.461 668.923M334.461 0L0 334.461L334.461 668.923',
  };

  const rightPath = {
    d: 'M0 668.923L167.462 334.461L0 0L334.462 334.461L0 668.923Z',
    stroke: 'M0 0L167.462 334.461L0 668.923M0 0L334.462 334.461L0 668.923',
  };

  const path = isLeft ? leftPath : rightPath;
  const gradientId = isLeft ? 'left-shader-gradient' : 'right-shader-gradient';

  const SvgComponent = (
    <div className={cn('relative', sizeConfig[size], className)}>
      {/* Shader Background Layer */}
      {useShader && (
        <div className='absolute inset-0 opacity-60 blur-sm'>
          <BracketShader
            speed={shaderSpeed}
            intensity={shaderIntensity}
            flowDirection={isLeft ? 1.0 : -1.0}
            energyPulse={0.8}
            colorIntensity={1.0}
          />
        </div>
      )}

      {/* SVG Bracket */}
      <svg
        viewBox='0 0 335 670'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={cn('relative z-10', sizeConfig[size])}
      >
        <g
          id={`${side}-shader-bracket`}
          className={animated ? 'animate-diamond-pulse' : ''}
          style={!isLeft ? { animationDelay: '1s' } : undefined}
        >
          <path d={path.d} fill={`url(#${gradientId})`} />
          <path
            d={path.stroke}
            stroke='currentColor'
            strokeWidth='15'
            strokeLinejoin='round'
          />
        </g>
        <defs>
          <linearGradient
            id={gradientId}
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
    </div>
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
