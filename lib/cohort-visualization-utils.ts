// Layout calculation functions for 3D cohort visualization

export type LayoutType = 'grid' | 'sphere' | 'helix';

export interface Position3D {
  x: number;
  y: number;
  z: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

/**
 * Calculate grid position for a cohort card
 * Arranges cards in a centered grid layout
 */
export const calculateGridPosition = (
  index: number,
  total: number
): Position3D => {
  const cols = 7;
  const rows = Math.ceil(total / cols);
  const row = Math.floor(index / cols);
  const col = index % cols;

  // Center the grid both horizontally and vertically
  const horizontalSpacing = 280; // 240px card + 40px gap
  const verticalSpacing = 360; // 320px card + 40px gap
  const horizontalOffset = ((cols - 1) * horizontalSpacing) / 2;
  const verticalOffset = ((rows - 1) * verticalSpacing) / 2;

  return {
    x: col * horizontalSpacing - horizontalOffset,
    y: row * verticalSpacing - verticalOffset,
    z: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  };
};

/**
 * Calculate sphere position for a cohort card
 * Distributes cards evenly on a sphere surface
 */
export const calculateSpherePosition = (
  index: number,
  total: number
): Position3D => {
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;
  const radius = 800;

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  // Calculate rotation to face outward from center
  const angleY = Math.atan2(x, z) * (180 / Math.PI);
  const angleX = -Math.asin(y / radius) * (180 / Math.PI);

  return {
    x,
    y,
    z,
    rotateX: angleX,
    rotateY: angleY,
    rotateZ: 0,
  };
};

/**
 * Calculate helix position for a cohort card
 * Arranges cards in a spiral helix pattern
 */
export const calculateHelixPosition = (
  index: number,
  _total: number
): Position3D => {
  const theta = index * 0.175 + Math.PI;
  const y = -(index * 50) + 500;
  const radius = 900;

  return {
    x: radius * Math.cos(theta),
    y,
    z: radius * Math.sin(theta),
    rotateX: 0,
    rotateY: -theta * (180 / Math.PI) + 90,
    rotateZ: 0,
  };
};

/**
 * Get color from cohort name based on color keywords
 */
export const getCohortColor = (cohortName: string): string => {
  const name = cohortName.toLowerCase();
  if (name.includes('blue')) return 'rgba(59, 130, 246, 0.8)';
  if (name.includes('purple')) return 'rgba(168, 85, 247, 0.8)';
  if (name.includes('green')) return 'rgba(34, 197, 94, 0.8)';
  if (name.includes('orange')) return 'rgba(249, 115, 22, 0.8)';
  if (name.includes('pink') || name.includes('rose') || name.includes('salmon'))
    return 'rgba(236, 72, 153, 0.8)';
  if (name.includes('yellow')) return 'rgba(234, 179, 8, 0.8)';
  if (name.includes('red') || name.includes('wine'))
    return 'rgba(239, 68, 68, 0.8)';
  if (name.includes('indigo')) return 'rgba(99, 102, 241, 0.8)';
  if (name.includes('turquoise') || name.includes('cyan'))
    return 'rgba(6, 182, 212, 0.8)';
  if (name.includes('silver') || name.includes('grey') || name.includes('gray'))
    return 'rgba(148, 163, 184, 0.8)';
  if (name.includes('bronze')) return 'rgba(205, 127, 50, 0.8)';
  if (name.includes('cobalt')) return 'rgba(0, 71, 171, 0.8)';
  if (name.includes('coral')) return 'rgba(255, 127, 80, 0.8)';
  if (name.includes('ginger')) return 'rgba(176, 141, 87, 0.8)';
  if (name.includes('neon')) return 'rgba(57, 255, 20, 0.8)';
  if (name.includes('mint')) return 'rgba(152, 255, 152, 0.8)';
  if (name.includes('magenta')) return 'rgba(255, 0, 255, 0.8)';
  if (name.includes('petrol')) return 'rgba(0, 87, 87, 0.8)';
  if (name.includes('rainbow')) return 'rgba(255, 0, 255, 0.8)';
  if (name.includes('ultraviolet')) return 'rgba(99, 66, 255, 0.8)';
  if (name.includes('white')) return 'rgba(240, 240, 240, 0.8)';
  if (name.includes('black')) return 'rgba(30, 30, 30, 0.8)';
  return 'rgba(139, 92, 246, 0.8)';
};

