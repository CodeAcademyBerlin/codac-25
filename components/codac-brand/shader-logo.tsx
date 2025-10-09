'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import {
  diamondFragmentShader,
  diamondVertexShader,
  logoFragmentShader,
  logoVertexShader,
} from './shaders/logo-shader';

interface ShaderLogoProps {
  className?: string;
}

function LogoShaderMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

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
      vertexShader={logoVertexShader}
      fragmentShader={logoFragmentShader}
      uniforms={uniforms}
      transparent
    />
  );
}

function DiamondShaderMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

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
      vertexShader={diamondVertexShader}
      fragmentShader={diamondFragmentShader}
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

function BackgroundEffect() {
  return (
    <mesh position={[0, 0, -1]} scale={[10, 10, 1]}>
      <planeGeometry args={[1, 1]} />
      <DiamondShaderMaterial />
    </mesh>
  );
}

export function ShaderLogo({ className }: ShaderLogoProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <BackgroundEffect />
        <LogoLeftDiamond />
        <LogoRightDiamond />
      </Canvas>
    </div>
  );
}

export default ShaderLogo;
