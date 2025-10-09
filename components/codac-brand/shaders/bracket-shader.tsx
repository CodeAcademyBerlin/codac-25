'use client';

import React, { forwardRef } from 'react';
import { Shader } from 'react-shaders';

import { cn } from '@/lib/utils';

export interface BracketShaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  intensity?: number;
  flowDirection?: number;
  energyPulse?: number;
  colorIntensity?: number;
}

const fragmentShader = `
void mainImage(out vec4 O, vec2 F)
{
    vec2 r = iResolution.xy;
    vec2 uv = F / r.xy;
    vec2 p = (2.0 * F - r) / min(r.x, r.y);
    
    float t = iTime * u_speed;
    
    // Create diamond-shaped energy flow
    float angle = atan(p.y, p.x);
    float radius = length(p);
    
    // Create flowing lines that follow diamond edges
    float flow1 = sin(angle * 4.0 + t * u_flowDirection) * 0.5 + 0.5;
    float flow2 = sin(angle * 4.0 - t * u_flowDirection + 1.57) * 0.5 + 0.5;
    
    // Energy pulse from center
    float pulse = sin(radius * 5.0 - t * 2.0) * 0.5 + 0.5;
    pulse *= exp(-radius * u_energyPulse);
    
    // Create diamond pattern with flowing energy
    float diamond = abs(p.x) + abs(p.y);
    float edge = smoothstep(0.8, 1.0, diamond) - smoothstep(1.0, 1.2, diamond);
    
    // Add flowing waves along the edges
    float wave = sin(diamond * 10.0 - t * 3.0) * 0.5 + 0.5;
    wave *= edge;
    
    // Combine effects
    float brightness = (flow1 * flow2 + pulse + wave) * u_intensity;
    
    // Create gradient colors (pink to cyan)
    vec3 color1 = vec3(0.906, 0.439, 0.588); // #E77096
    vec3 color2 = vec3(0.322, 0.918, 0.808); // #52EACE
    
    // Mix colors based on position and time
    float colorMix = (sin(angle * 2.0 + t) * 0.5 + 0.5) * u_colorIntensity;
    vec3 color = mix(color1, color2, colorMix);
    
    // Add glow effect
    float glow = exp(-radius * 0.5) * brightness;
    
    // Final output with transparency
    O = vec4(color * brightness + glow, brightness * 0.8);
}
`;

export const BracketShader = forwardRef<HTMLDivElement, BracketShaderProps>(
  (
    {
      className,
      speed = 0.5,
      intensity = 1.2,
      flowDirection = 1.0,
      energyPulse = 0.8,
      colorIntensity = 1.0,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('w-full h-full', className)} {...props}>
        <Shader
          fs={fragmentShader}
          uniforms={{
            u_speed: { type: '1f', value: speed },
            u_intensity: { type: '1f', value: intensity },
            u_flowDirection: { type: '1f', value: flowDirection },
            u_energyPulse: { type: '1f', value: energyPulse },
            u_colorIntensity: { type: '1f', value: colorIntensity },
          }}
          style={{ width: '100%', height: '100%' } as CSSStyleDeclaration}
        />
      </div>
    );
  }
);

BracketShader.displayName = 'BracketShader';
