'use client';

import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { motion } from 'framer-motion';
import { Globe, LayoutGrid, RotateCcw, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface User {
  name: string;
  username: string;
  email: string;
  role: string;
  bio: string;
  image: string;
  githubUrl: string;
  start_date: string | null;
  end_date: string | null;
  course: string;
  cohort: string;
}

export interface Cohort {
  name: string;
  slug: string;
  image: string;
  start_date: string | null;
  end_date: string | null;
}

interface CohortPeriodicTableFramerProps {
  cohorts: Cohort[];
  users: User[];
}

type LayoutType = 'grid' | 'sphere' | 'helix';

// Layout calculation functions (scaled for CSS pixels)
const calculateGridPosition = (index: number, total: number) => {
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
    y: -(row * verticalSpacing) + verticalOffset,
    z: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  };
};

const calculateSpherePosition = (index: number, total: number) => {
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

const calculateHelixPosition = (index: number, _total: number) => {
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

// Get color from cohort name
const getCohortColor = (cohortName: string) => {
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

interface CohortCardProps {
  cohort: Cohort;
  index: number;
  position: ReturnType<typeof calculateGridPosition>;
  isSelected: boolean;
  onClick: () => void;
  zIndex: number;
}

function CohortCard({
  cohort,
  index,
  position,
  isSelected,
  onClick,
  zIndex,
}: CohortCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className='cohort-card-3d'
      style={{
        position: 'absolute',
        width: '240px',
        height: '320px',
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
        zIndex: isSelected ? 9999 : zIndex,
      }}
      initial={{
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        z: Math.random() * 2000 - 1000,
        rotateX: Math.random() * 360,
        rotateY: Math.random() * 360,
        rotateZ: Math.random() * 360,
        opacity: 0,
      }}
      animate={{
        x: position.x,
        y: position.y,
        z: position.z,
        rotateX: position.rotateX,
        rotateY: position.rotateY,
        rotateZ: position.rotateZ,
        opacity: 1,
        scale: isSelected ? 1.3 : hovered ? 1.05 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        mass: 1,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          border: isSelected
            ? '6px solid rgba(255, 255, 255, 0.9)'
            : '3px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          transition: 'all 0.3s ease',
          boxShadow: isSelected
            ? '0 32px 100px rgba(139, 92, 246, 0.9), 0 0 0 5px rgba(139, 92, 246, 0.7)'
            : hovered
              ? '0 16px 64px rgba(0, 0, 0, 0.8)'
              : '0 8px 32px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          transform: 'perspective(1000px) rotateY(0deg)',
          filter: isSelected ? 'brightness(1.4) saturate(1.2)' : 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Background image */}
        <img
          src={`/${cohort.image}`}
          alt={cohort.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
          }}
        />

        {/* Gradient overlays */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '80px',
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background:
              'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 2,
          }}
        />

        {/* Number badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: getCohortColor(cohort.name),
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          {index + 1}
        </div>

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              lineHeight: '1.2',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            }}
          >
            {cohort.name}
          </div>
          {cohort.start_date && cohort.end_date && (
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '13px',
                fontWeight: '500',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              }}
            >
              {new Date(cohort.start_date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}{' '}
              -{' '}
              {new Date(cohort.end_date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CohortPeriodicTableFramer({
  cohorts,
  users,
}: CohortPeriodicTableFramerProps) {
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('grid');
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const selectedCohortData = selectedCohort
    ? cohorts.find(c => c.slug === selectedCohort)
    : null;

  const currentIndex = selectedCohort
    ? cohorts.findIndex(c => c.slug === selectedCohort)
    : -1;

  const hasNext = currentIndex >= 0 && currentIndex < cohorts.length - 1;
  const hasPrevious = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) {
      setSelectedCohort(cohorts[currentIndex + 1].slug);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      setSelectedCohort(cohorts[currentIndex - 1].slug);
    }
  };

  const handleResetView = () => {
    setSelectedCohort(null);
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  // Calculate card positions with z-index based on depth
  const cardData = useMemo(() => {
    const data = cohorts.map((cohort, i) => {
      let position;

      if (currentLayout === 'grid') {
        position = calculateGridPosition(i, cohorts.length);
      } else if (currentLayout === 'sphere') {
        position = calculateSpherePosition(i, cohorts.length);
      } else {
        position = calculateHelixPosition(i, cohorts.length);
      }

      return {
        cohort,
        position,
        index: i,
      };
    });

    // Calculate z-index based on depth (z position after rotation)
    return data
      .map(item => {
        // Simple depth calculation based on z position
        const depth = item.position.z;
        return {
          ...item,
          zIndex: Math.floor(1000 + depth),
        };
      })
      .sort((a, b) => a.zIndex - b.zIndex); // Render back to front
  }, [cohorts, currentLayout]);

  // Handle mouse interactions for rotation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - lastMouse.current.x;
      const deltaY = e.clientY - lastMouse.current.y;

      setRotation(prev => ({
        x: prev.x + deltaY * 0.3,
        y: prev.y + deltaX * 0.3,
      }));

      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(prev => Math.max(0.3, Math.min(3, prev - e.deltaY * 0.001)));
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className='relative w-full h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden'>
      <ResizablePanelGroup direction='horizontal' className='h-screen'>
        {/* 3D Visualization Panel */}
        <ResizablePanel defaultSize={70} minSize={30}>
          <div
            ref={containerRef}
            className='relative w-full h-full overflow-hidden'
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                perspective: '2000px',
                perspectiveOrigin: 'center center',
              }}
            >
              <motion.div
                style={{
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  width: '100%',
                  height: '100%',
                }}
                animate={{
                  rotateX: rotation.x,
                  rotateY: rotation.y,
                  scale: zoom,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 30,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {cardData.map(data => (
                    <CohortCard
                      key={data.cohort.slug}
                      cohort={data.cohort}
                      index={data.index}
                      position={data.position}
                      isSelected={selectedCohort === data.cohort.slug}
                      onClick={() => setSelectedCohort(data.cohort.slug)}
                      zIndex={data.zIndex}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </ResizablePanel>

        {/* Resizable Handle */}
        <ResizableHandle />

        {/* Detail Panel */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className='h-full bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden'>
            {/* Layout Picker - Always visible at top */}
            <div className='p-6 border-b border-white/10'>
              <div className='flex items-center justify-between mb-3'>
                <h2 className='text-white text-sm font-semibold'>
                  Layout Mode
                </h2>
                <button
                  onClick={handleResetView}
                  className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all text-sm font-medium'
                  title='Reset view'
                >
                  <RotateCcw className='w-4 h-4' />
                  <span>Reset</span>
                </button>
              </div>
              <Menubar className='border-white/10 bg-black/20'>
                <MenubarMenu>
                  <MenubarTrigger
                    onClick={() => setCurrentLayout('grid')}
                    className={`flex items-center gap-2 ${
                      currentLayout === 'grid'
                        ? 'bg-blue-500 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className='w-4 h-4' />
                    <span>Grid</span>
                  </MenubarTrigger>
                </MenubarMenu>

                <MenubarMenu>
                  <MenubarTrigger
                    onClick={() => setCurrentLayout('sphere')}
                    className={`flex items-center gap-2 ${
                      currentLayout === 'sphere'
                        ? 'bg-purple-500 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Globe className='w-4 h-4' />
                    <span>Sphere</span>
                  </MenubarTrigger>
                </MenubarMenu>

                <MenubarMenu>
                  <MenubarTrigger
                    onClick={() => setCurrentLayout('helix')}
                    className={`flex items-center gap-2 ${
                      currentLayout === 'helix'
                        ? 'bg-pink-500 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Sparkles className='w-4 h-4' />
                    <span>Helix</span>
                  </MenubarTrigger>
                </MenubarMenu>
              </Menubar>
            </div>

            {selectedCohortData ? (
              /* Cohort Details */
              <div className='flex-1 flex flex-col overflow-hidden'>
                {/* Cohort Header */}
                <div className='p-6 border-b border-white/10'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <h2 className='text-2xl font-bold text-white mb-2'>
                        {selectedCohortData.name}
                      </h2>
                      {selectedCohortData.start_date &&
                        selectedCohortData.end_date && (
                          <p className='text-slate-400 text-sm'>
                            {new Date(
                              selectedCohortData.start_date
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            -{' '}
                            {new Date(
                              selectedCohortData.end_date
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                    </div>
                    <button
                      onClick={() => setSelectedCohort(null)}
                      className='p-2 hover:bg-white/10 rounded-lg transition-colors'
                      aria-label='Clear selection'
                    >
                      <svg
                        className='w-5 h-5 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Cohort Image */}
                  <div className='w-full h-32 rounded-lg overflow-hidden border-2 border-white/20'>
                    <Image
                      width={100}
                      height={100}
                      src={selectedCohortData.image}
                      alt={selectedCohortData.name}
                      className='w-full h-full object-cover rounded-lg'
                    />
                  </div>
                </div>

                {/* Members List */}
                <div className='flex-1 overflow-y-auto p-6'>
                  <h3 className='text-lg font-semibold text-white mb-4'>
                    Members (
                    {
                      users.filter(u => u.cohort === selectedCohortData.slug)
                        .length
                    }
                    )
                  </h3>
                  <div className='space-y-3'>
                    {users
                      .filter(u => u.cohort === selectedCohortData.slug)
                      .map(user => (
                        <div
                          key={user.username}
                          className='flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors'
                        >
                          <Image
                            width={100}
                            height={100}
                            src={`/${user.image || selectedCohortData.image}`}
                            alt={user.name}
                            className='w-10 h-10 rounded-full object-cover border-2 border-white/20'
                          />
                          <div className='flex-1 min-w-0'>
                            <p className='text-white font-medium text-sm truncate'>
                              {user.name}
                            </p>
                            <p className='text-slate-400 text-xs truncate'>
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className='p-4 border-t border-white/10 flex items-center justify-between'>
                  <button
                    onClick={handlePrevious}
                    disabled={!hasPrevious}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasPrevious
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>
                  <span className='text-slate-400 text-sm'>
                    {currentIndex + 1} / {cohorts.length}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasNext
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className='flex-1 flex flex-col items-center justify-center p-8 text-center'>
                <div className='w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4'>
                  <svg
                    className='w-10 h-10 text-white/30'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-white mb-2'>
                  No Cohort Selected
                </h3>
                <p className='text-slate-400 text-sm max-w-xs'>
                  Click on any cohort card in the 3D space to view its details
                  and members.
                </p>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
