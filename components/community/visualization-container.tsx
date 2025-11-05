'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Cohort, User } from '@/types/cohort';
import type { LayoutType } from '@/lib/cohort-visualization-utils';
import {
  calculateGridPosition,
  calculateHelixPosition,
  calculateSpherePosition,
} from '@/lib/cohort-visualization-utils';
import { CohortCard } from './cohort-card';

interface VisualizationContainerProps {
  cohorts: Cohort[];
  users: User[];
  selectedCohort: string | null;
  currentLayout: LayoutType;
  onSelectCohort: (slug: string) => void;
}

export function VisualizationContainer({
  cohorts,
  users,
  selectedCohort,
  currentLayout,
  onSelectCohort,
}: VisualizationContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.5);
  const [hasAnimated, setHasAnimated] = useState(false);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Map of all cohort members
  const cohortMembersMap = useMemo(() => {
    const map = new Map<string, User[]>();
    cohorts.forEach(cohort => {
      map.set(
        cohort.slug,
        users.filter(user => user.cohort === cohort.slug)
      );
    });
    return map;
  }, [users, cohorts]);

  // Set up opening animation
  useEffect(() => {
    if (!hasAnimated) {
      // Start with dramatic rotation
      setRotation({ x: -15, y: 15 });
      setZoom(0.4);

      // Animate to final position
      const timer = setTimeout(() => {
        setRotation({ x: 0, y: 0 });
        setZoom(0.5);
        setHasAnimated(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [hasAnimated]);

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
    const dataWithZIndex = data.map(item => {
      const depth = item.position.z;
      return {
        ...item,
        zIndex: Math.floor(1000 + depth),
      };
    });

    // Only sort by depth for 3D layouts (sphere, helix), keep original order for grid
    return currentLayout === 'grid'
      ? dataWithZIndex
      : dataWithZIndex.sort((a, b) => a.zIndex - b.zIndex);
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
      setZoom(prev => Math.max(0.2, Math.min(2, prev - e.deltaY * 0.001)));
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
    <div ref={containerRef} className='relative w-full h-full overflow-hidden'>
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
          initial={{
            rotateX: -45,
            rotateY: 45,
            scale: 0.3,
          }}
          animate={{
            rotateX: rotation.x,
            rotateY: rotation.y,
            scale: zoom,
          }}
          transition={{
            type: 'spring',
            stiffness: 50,
            damping: 25,
            mass: 1.5,
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
                cohortMembers={cohortMembersMap.get(data.cohort.slug) || []}
                index={data.index}
                position={data.position}
                isSelected={selectedCohort === data.cohort.slug}
                onClick={() => onSelectCohort(data.cohort.slug)}
                zIndex={data.zIndex}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

