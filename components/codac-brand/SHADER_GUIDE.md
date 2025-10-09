# Codac Logo Shader Implementation Guide

## Overview

This guide explains the new shader-enhanced Codac logo components that were created based on the singularity-shader example.

## What Was Created

### 1. **BracketShader** (`shaders/bracket-shader.tsx`)

A custom WebGL shader specifically designed for the Codac logo brackets with:

- Dynamic energy flow patterns
- Pulsing effects
- Codac brand color gradient (#E77096 to #52EACE)
- Customizable parameters (speed, intensity, flow direction, energy pulse, color intensity)

### 2. **CodacShaderBracket** (`codac-shader-bracket.tsx`)

An enhanced bracket component that integrates the shader with the SVG bracket geometry:

- Supports both left and right brackets
- Optional shader background layer
- Animation support with framer-motion
- Configurable shader parameters

### 3. **CodacLogoWithShader** (`codac-logo-with-shader.tsx`)

Complete logo component with integrated shader effects:

- Full logo with both shader-enhanced brackets
- Text support with gradient options
- Multiple size variants
- Landing page variant
- Preset component: `CodacShaderLandingLogo`

### 4. **Example Component** (`examples/shader-logo-example.tsx`)

Demonstrates various configurations and use cases

### 5. **Documentation** (`shaders/README.md`)

Comprehensive documentation covering all aspects

## Quick Start

### Basic Usage

```tsx
import { CodacLogoWithShader } from '@/components/codac-brand/codac-logo-with-shader';

function MyComponent() {
  return <CodacLogoWithShader text='codac' size='lg' useShader useGradient />;
}
```

### Landing Page Hero

```tsx
import { CodacShaderLandingLogo } from '@/components/codac-brand/codac-logo-with-shader';

function LandingPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-black'>
      <CodacShaderLandingLogo />
    </div>
  );
}
```

### Custom Shader Settings

```tsx
<CodacLogoWithShader
  text='codac'
  size='xl'
  useShader
  useGradient
  animated
  shaderIntensity={1.5} // Brightness
  shaderSpeed={0.7} // Animation speed
  showAnimatedBackground // Additional glow effect
/>
```

### Individual Brackets

```tsx
import { CodacShaderBracket } from '@/components/codac-brand/codac-shader-bracket';

function CustomLayout() {
  return (
    <div className='flex gap-4'>
      <CodacShaderBracket
        side='left'
        size='lg'
        useShader
        shaderIntensity={1.2}
        shaderSpeed={0.5}
      />
      <div>Your content here</div>
      <CodacShaderBracket
        side='right'
        size='lg'
        useShader
        shaderIntensity={1.2}
        shaderSpeed={0.5}
      />
    </div>
  );
}
```

## Comparison with Original Logo

### Original Logo (`codac-logo.tsx`)

- Static SVG brackets with linear gradient
- CSS animations only
- Lighter weight
- No WebGL dependency

### Shader Logo (`codac-logo-with-shader.tsx`)

- Dynamic WebGL shader effects
- Flowing energy animations
- Interactive visual effects
- Requires WebGL support
- Slightly heavier (includes shader rendering)

## When to Use Which

### Use Original Logo When:

- Simple branding needs
- Performance is critical
- WebGL support is uncertain
- Static displays

### Use Shader Logo When:

- Landing pages / hero sections
- Premium feel desired
- Interactive elements
- Modern browsers guaranteed
- Visual impact is priority

## Performance Notes

- Shaders are GPU-accelerated (performant)
- Mobile devices: Consider reducing intensity/speed
- Falls back gracefully if WebGL unavailable
- No impact on SEO (client-side only)

## Customization Examples

### Slower, Subtle Effect

```tsx
<CodacLogoWithShader useShader shaderIntensity={0.8} shaderSpeed={0.3} />
```

### High Energy Effect

```tsx
<CodacLogoWithShader useShader shaderIntensity={2.0} shaderSpeed={1.5} />
```

### Logo Only (No Text)

```tsx
<CodacLogoWithShader logoOnly useShader size='xl' />
```

## File Structure

```
components/codac-brand/
├── shaders/
│   ├── bracket-shader.tsx       # New shader component
│   ├── singularity-shader.tsx   # Original example shader
│   ├── index.ts                 # Shader exports
│   └── README.md                # Detailed shader docs
├── examples/
│   └── shader-logo-example.tsx  # Usage examples
├── codac-shader-bracket.tsx     # Shader-enabled bracket
├── codac-logo-with-shader.tsx   # Complete shader logo
├── codac-logo.tsx               # Original logo (unchanged)
├── codac-left-angle-bracket.tsx # Original left bracket
├── codac-right-angle-bracket.tsx# Original right bracket
└── SHADER_GUIDE.md              # This file
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ Older browsers: Falls back to SVG only

## Dependencies

These components require:

- `react-shaders` - WebGL shader rendering
- `framer-motion` - Animations
- `@/lib/utils` - Utility functions

## Next Steps

1. Try the examples in `examples/shader-logo-example.tsx`
2. Integrate into your landing page
3. Customize shader parameters to your taste
4. Create additional shader variants if needed

For detailed technical information, see `shaders/README.md`.
