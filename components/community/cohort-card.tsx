'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Cohort, User } from '@/types/cohort';
import type { Position3D } from '@/lib/cohort-visualization-utils';
import { getCohortColor } from '@/lib/cohort-visualization-utils';

interface CohortCardProps {
  cohort: Cohort;
  cohortMembers: User[];
  index: number;
  position: Position3D;
  isSelected: boolean;
  onClick: () => void;
  zIndex: number;
}

export function CohortCard({
  cohort,
  cohortMembers,
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
        x: 0,
        y: 0,
        z: -2000,
        rotateX: 180,
        rotateY: 0,
        rotateZ: 360,
        opacity: 0,
        scale: 0.3,
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
        stiffness: 60,
        damping: 15,
        mass: 1,
        delay: index * 0.05,
        opacity: { duration: 0.6, delay: index * 0.05 },
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
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          {cohortMembers.length}
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
          {cohort.startDate && cohort.endDate && (
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '13px',
                fontWeight: '500',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              }}
            >
              {cohort.startDate.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}{' '}
              -{' '}
              {cohort.endDate.toLocaleDateString('en-US', {
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
