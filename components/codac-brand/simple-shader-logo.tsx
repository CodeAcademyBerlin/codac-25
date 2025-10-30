'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { cn } from '@/lib/utils';

interface SimpleShaderLogoProps {
  className?: string;
}

function LogoShaderMaterial() {
  const materialRef = useRef<any>(null);

  // Define uniforms for the shader
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      colorA: { value: new THREE.Color('#E77096') }, // Codac pink
      colorB: { value: new THREE.Color('#52EACE') }, // Codac teal
    }),
    []
  );

  // Update the time uniform on each frame
  useFrame(state => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={`
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        uniform float time;
        uniform vec3 colorA;
        uniform vec3 colorB;
        varying vec2 vUv;
        
        // Simple noise function
        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
          // Create gradient from top to bottom
          vec3 color = mix(colorA, colorB, vUv.y);
          
          // Add some noise/glitter effect
          float n = noise(vUv * 100.0 + time * 0.1);
          
          // Add pulsing effect
          float pulse = 0.5 * (1.0 + sin(time * 2.0));
          
          // Add glow at the edges
          float dist = length(vUv - 0.5) * 2.0;
          float glow = smoothstep(0.8, 1.0, dist) * 0.5 * pulse;
          
          // Mix in some sparkles
          color = mix(color, vec3(1.0), n * 0.1 * pulse);
          
          // Add the glow
          color = mix(color, vec3(1.0), glow);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `}
      uniforms={uniforms}
      transparent
    />
  );
}

function LogoLeftDiamond() {
  return (
    <mesh position={[-1.5, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <LogoShaderMaterial />
    </mesh>
  );
}

function LogoRightDiamond() {
  return (
    <mesh position={[1.5, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <LogoShaderMaterial />
    </mesh>
  );
}

function CodacText() {
  const materialRef = useRef<any>(null);

  // Define uniforms for the shader
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      colorA: { value: new THREE.Color('#E77096') }, // Codac pink
      colorB: { value: new THREE.Color('#52EACE') }, // Codac teal
    }),
    []
  );

  // Update the time uniform on each frame
  useFrame(state => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, -1.2, 0]}>
      <planeGeometry args={[3, 0.8]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform vec3 colorA;
          uniform vec3 colorB;
          varying vec2 vUv;
          
          void main() {
            // Animated gradient
            vec3 color = mix(colorA, colorB, vUv.y + 0.5 * sin(time * 0.5 + vUv.x * 5.0));
            gl_FragColor = vec4(color, 1.0);
          }
        `}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function SimpleShaderLogo({ className }: SimpleShaderLogoProps) {
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn('h-[400px]', className)} />;
  }

  return (
    <div className={cn('h-[400px]', className)}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <LogoLeftDiamond />
        <LogoRightDiamond />
        <CodacText />
      </Canvas>
    </div>
  );
}

export default SimpleShaderLogo;
