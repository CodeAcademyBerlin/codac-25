'use client';

import { useEffect, useMemo, useState } from 'react';

import { Canvas, ShaderParams } from './canvas';

const params = {
  refraction: {
    min: 0,
    max: 0.06,
    step: 0.001,
    default: 0.015,
  },
  edge: {
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.1,
  },
  patternBlur: {
    min: 0,
    max: 0.05,
    step: 0.001,
    default: 0.04,
  },
  liquid: {
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.07,
  },
  speed: {
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.05,
  },
  patternScale: {
    min: 1,
    max: 10,
    step: 0.1,
    default: 2,
  },
};

const defaultParams = Object.fromEntries(
  Object.entries(params).map(([key, value]) => [key, value.default])
) as ShaderParams;

/**
 * Convert serialized image data to a data URL for static fallback
 */
function imageDataToDataUrl(serializedData: {
  width: number;
  height: number;
  data: number[];
}): string {
  // Create a canvas element to convert the image data to a data URL
  if (typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = serializedData.width;
  canvas.height = serializedData.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const imageData = new ImageData(
    new Uint8ClampedArray(serializedData.data),
    serializedData.width,
    serializedData.height
  );

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export const CodacLogoCanvas = ({
  imageData: serializedData,
}: {
  imageData: {
    imageData: { width: number; height: number; data: number[] };
  };
}) => {
  const [isMounted, setIsMounted] = useState(false);

  // Create static fallback data URL
  const fallbackImageUrl = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return imageDataToDataUrl(serializedData.imageData);
  }, [serializedData]);

  // Reconstruct browser ImageData from serialized data
  const imageData = useMemo(() => {
    if (typeof window === 'undefined' || !isMounted) return null;
    return new ImageData(
      new Uint8ClampedArray(serializedData.imageData.data),
      serializedData.imageData.width,
      serializedData.imageData.height
    );
  }, [serializedData, isMounted]);

  // Hydrate to canvas after mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  // Show static image during SSR and initial mount
  if (!imageData || !isMounted) {
    return fallbackImageUrl ? (
      <img
        src={fallbackImageUrl}
        alt='CODAC Logo'
        className='block h-full w-full object-contain'
        style={{ imageRendering: 'crisp-edges' }}
        suppressHydrationWarning
      />
    ) : null;
  }

  return <Canvas imageData={imageData} params={defaultParams} />;
};
