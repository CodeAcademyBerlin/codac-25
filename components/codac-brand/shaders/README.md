# Codac Logo Shaders

This directory contains shader components designed specifically for the Codac brand logo brackets.

## Components

### BracketShader

A dynamic, flowing energy shader designed to complement the diamond/bracket shapes of the Codac logo.

#### Features

- **Dynamic Energy Flow**: Flowing lines that follow the diamond edges
- **Pulsing Effect**: Energy pulses emanating from the center
- **Brand Colors**: Uses Codac's gradient colors (#E77096 to #52EACE)
- **Customizable Parameters**: Control speed, intensity, flow direction, and more

#### Props

```typescript
interface BracketShaderProps {
  speed?: number; // Animation speed (default: 0.5)
  intensity?: number; // Overall brightness (default: 1.2)
  flowDirection?: number; // Direction of energy flow (default: 1.0)
  energyPulse?: number; // Intensity of pulse effect (default: 0.8)
  colorIntensity?: number; // Color mixing intensity (default: 1.0)
  className?: string; // Additional CSS classes
}
```

#### Usage

```tsx
import { BracketShader } from '@/components/codac-brand/shaders/bracket-shader';

// Basic usage
<BracketShader />

// With custom settings
<BracketShader
  speed={0.7}
  intensity={1.5}
  flowDirection={-1.0}
  energyPulse={1.2}
  colorIntensity={0.8}
/>
```

## Integration Components

### CodacShaderBracket

A bracket component that integrates the shader effect with the SVG bracket geometry.

#### Props

```typescript
interface CodacShaderBracketProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '8xl';
  side?: 'left' | 'right';
  animated?: boolean;
  useShader?: boolean;
  shaderIntensity?: number;
  shaderSpeed?: number;
  className?: string;
}
```

#### Usage

```tsx
import { CodacShaderBracket } from '@/components/codac-brand/codac-shader-bracket';

// Left bracket with shader
<CodacShaderBracket
  side="left"
  size="lg"
  useShader
  shaderIntensity={1.2}
  shaderSpeed={0.5}
/>

// Right bracket with animation
<CodacShaderBracket
  side="right"
  size="lg"
  animated
  useShader
/>
```

### CodacLogoWithShader

Complete logo component with integrated shader effects on both brackets.

#### Props

```typescript
interface CodacLogoWithShaderProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '8xl';
  logoOnly?: boolean;
  useGradient?: boolean;
  useShader?: boolean;
  shaderIntensity?: number;
  shaderSpeed?: number;
  animated?: boolean;
  showAnimatedBackground?: boolean;
  landingPageVariant?: boolean;
  className?: string;
  textClassName?: string;
  logoClassName?: string;
}
```

#### Usage

```tsx
import { CodacLogoWithShader } from '@/components/codac-brand/codac-logo-with-shader';

// Basic logo with shader
<CodacLogoWithShader
  text="codac"
  size="lg"
  useShader
  useGradient
/>

// Landing page variant
<CodacShaderLandingLogo />

// Custom configuration
<CodacLogoWithShader
  text="codac"
  size="xl"
  useShader
  useGradient
  animated
  shaderIntensity={1.5}
  shaderSpeed={0.7}
  showAnimatedBackground
/>
```

## Examples

See `components/codac-brand/examples/shader-logo-example.tsx` for complete usage examples.

## Technical Details

### Shader Implementation

The bracket shader is implemented using GLSL (OpenGL Shading Language) and rendered via the `react-shaders` library. The shader creates:

1. **Diamond Pattern**: Geometric pattern that aligns with the bracket shapes
2. **Energy Flow**: Animated flowing lines that follow the edges
3. **Pulse Effect**: Radial pulses from the center
4. **Color Gradient**: Dynamic mixing between Codac brand colors

### Performance Considerations

- Shaders are rendered using WebGL for optimal performance
- The shader uses `forwardRef` for proper React integration
- Animations are GPU-accelerated
- Consider using lower intensity/speed values on mobile devices

### Browser Compatibility

- Requires WebGL support
- Fallback: If WebGL is not available, only the SVG brackets will be displayed
- Tested on: Chrome, Firefox, Safari, Edge (latest versions)

## Customization

### Creating New Shader Variants

To create a new shader variant:

1. Copy `bracket-shader.tsx` as a starting point
2. Modify the `fragmentShader` GLSL code
3. Add/modify uniforms as needed
4. Update the props interface
5. Test performance across devices

### Adjusting Colors

To use different colors, modify the color vectors in the shader:

```glsl
// Current Codac colors
vec3 color1 = vec3(0.906, 0.439, 0.588); // #E77096 (pink)
vec3 color2 = vec3(0.322, 0.918, 0.808); // #52EACE (cyan)

// Example: Custom colors
vec3 color1 = vec3(1.0, 0.0, 0.0); // Red
vec3 color2 = vec3(0.0, 0.0, 1.0); // Blue
```

## Dependencies

- `react-shaders`: For shader rendering
- `framer-motion`: For bracket animations
- `@/lib/utils`: For className utilities

## License

Part of the Codac brand components.
