'use client';

import React from 'react';

import {
  CodacLogoWithShader,
  CodacShaderLandingLogo,
} from '../codac-logo-with-shader';

/**
 * Example usage of the Codac Logo with Shader effects
 *
 * This component demonstrates different configurations of the shader-enabled logo
 */
export const ShaderLogoExamples: React.FC = () => {
  return (
    <div className='space-y-12 p-8 bg-background'>
      {/* Basic Shader Logo */}
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold'>Basic Shader Logo</h2>
        <CodacLogoWithShader text='codac' size='lg' useShader useGradient />
      </div>

      {/* Animated Shader Logo */}
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold'>Animated Shader Logo</h2>
        <CodacLogoWithShader
          text='codac'
          size='xl'
          useShader
          useGradient
          animated
          shaderIntensity={1.5}
          shaderSpeed={0.7}
        />
      </div>

      {/* Landing Page Variant */}
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold'>Landing Page Variant</h2>
        <div className='bg-black/50 p-8 rounded-lg flex items-center justify-center'>
          <CodacShaderLandingLogo />
        </div>
      </div>

      {/* Custom Shader Settings */}
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold'>Custom Shader Settings</h2>
        <div className='flex gap-8 flex-wrap'>
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>High Intensity</p>
            <CodacLogoWithShader
              size='md'
              useShader
              shaderIntensity={2.0}
              shaderSpeed={1.0}
            />
          </div>
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>Slow Animation</p>
            <CodacLogoWithShader
              size='md'
              useShader
              shaderIntensity={1.0}
              shaderSpeed={0.2}
            />
          </div>
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>Fast & Bright</p>
            <CodacLogoWithShader
              size='md'
              useShader
              shaderIntensity={1.8}
              shaderSpeed={1.5}
            />
          </div>
        </div>
      </div>

      {/* Logo Only (No Text) */}
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold'>Logo Only</h2>
        <CodacLogoWithShader
          logoOnly
          size='xl'
          useShader
          animated
          showAnimatedBackground
        />
      </div>

      {/* Different Sizes */}
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold'>Size Variants</h2>
        <div className='flex gap-8 items-center flex-wrap'>
          <CodacLogoWithShader size='xs' useShader />
          <CodacLogoWithShader size='sm' useShader />
          <CodacLogoWithShader size='md' useShader />
          <CodacLogoWithShader size='lg' useShader />
        </div>
      </div>
    </div>
  );
};

export default ShaderLogoExamples;
