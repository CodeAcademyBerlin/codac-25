'use client';

import { SimpleShaderLogo } from './simple-shader-logo';

interface ShaderLogoProps {
  className?: string;
}

export function ShaderLogo({ className }: ShaderLogoProps) {
  return <SimpleShaderLogo className={className} />;
}

export default ShaderLogo;
