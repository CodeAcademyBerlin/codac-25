'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { CodacShaderBracket } from './codac-shader-bracket';

interface CodacLogoWithShaderProps {
  /**
   * Optional text to display alongside the logo
   */
  text?: string;

  /**
   * Size variant for the logo
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '8xl';

  /**
   * Whether to show only the logo without text
   */
  logoOnly?: boolean;

  /**
   * Custom className for additional styling
   */
  className?: string;

  /**
   * Custom className for the text
   */
  textClassName?: string;

  /**
   * Custom className for the logo container
   */
  logoClassName?: string;

  /**
   * Whether to use the brand gradient colors
   */
  useGradient?: boolean;

  /**
   * Whether to use the shader effect on the brackets
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
   * Whether to animate the brackets on mount
   */
  animated?: boolean;

  /**
   * Whether to show the animated background effects
   */
  showAnimatedBackground?: boolean;

  /**
   * Whether to use the landing page variant with enhanced styling
   */
  landingPageVariant?: boolean;
}

const sizeConfig = {
  xs: {
    logo: 'w-6 h-6',
    text: 'text-sm',
  },
  sm: {
    logo: 'w-8 h-8',
    text: 'text-base',
  },
  md: {
    logo: 'w-12 h-12',
    text: 'text-lg',
  },
  lg: {
    logo: 'w-16 h-16',
    text: 'text-xl',
  },
  xl: {
    logo: 'w-20 h-20',
    text: 'text-2xl',
  },
  '2xl': {
    logo: 'w-24 h-24',
    text: 'text-3xl',
  },
  '8xl': {
    logo: 'w-96 h-96',
    text: 'text-8xl',
  },
};

export const CodacLogoWithShader: React.FC<CodacLogoWithShaderProps> = ({
  text,
  size = 'md',
  logoOnly = false,
  className,
  textClassName,
  logoClassName,
  useGradient = false,
  useShader = true,
  shaderIntensity = 1.2,
  shaderSpeed = 0.5,
  animated = true,
  showAnimatedBackground = false,
  landingPageVariant = false,
}) => {
  const config = sizeConfig[size];
  const showText = !logoOnly && text;

  const containerClasses = cn('flex items-center', className);

  const textClasses = cn(
    'font-codac-brand font-medium tracking-tight',
    'uppercase',
    config.text,
    useGradient && 'bg-gradient-codac bg-clip-text text-transparent',
    textClassName
  );

  const logoClasses = cn(
    config.logo,
    landingPageVariant &&
      size === '2xl' &&
      'scale-[2.5] md:scale-[3] lg:scale-[3.5]',
    logoClassName
  );

  return (
    <div className={containerClasses}>
      <div className={cn(logoClasses, 'relative')}>
        {/* Animated Background Effect */}
        {showAnimatedBackground && (
          <div className='absolute inset-0 bg-gradient-codac rounded-full blur-3xl opacity-20 scale-110 animate-gradient-shift'></div>
        )}

        {/* Logo Container */}
        <div
          className={cn(
            'relative flex items-center justify-center gap-1',
            showAnimatedBackground && 'bg-background/50'
          )}
        >
          {/* Left Bracket with Shader */}
          <CodacShaderBracket
            side='left'
            size={size}
            animated={animated}
            useShader={useShader}
            shaderIntensity={shaderIntensity}
            shaderSpeed={shaderSpeed}
            className='relative z-10'
          />

          {/* Right Bracket with Shader */}
          <CodacShaderBracket
            side='right'
            size={size}
            animated={animated}
            useShader={useShader}
            shaderIntensity={shaderIntensity}
            shaderSpeed={shaderSpeed}
            className='relative z-10'
          />

          {/* Text */}
          {showText && <span className={cn(textClasses, 'ml-2')}>{text}</span>}
        </div>
      </div>
    </div>
  );
};

// Convenient preset components

export const CodacShaderLandingLogo: React.FC<
  Omit<CodacLogoWithShaderProps, 'text'>
> = props => (
  <CodacLogoWithShader
    text='codac'
    useGradient
    useShader
    showAnimatedBackground
    landingPageVariant
    size='2xl'
    shaderIntensity={1.5}
    shaderSpeed={0.3}
    {...props}
  />
);

export default CodacLogoWithShader;
