'use client';

import { motion } from 'framer-motion';

import { CodacLeftAngleBracket } from './codac-left-angle-bracket';
import { CodacRightAngleBracket } from './codac-right-angle-bracket';

export function AnimatedLandingContent() {
  return (
    <div className='flex justify-center items-center h-full'>
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{
          duration: 3,
          delay: 2,
          ease: [0, 0.71, 0.2, 1.01],
        }}
      >
        <CodacLeftAngleBracket size='6xl' animated />
      </motion.div>

      <motion.div
        className='animate-diamond-pulse opacity-0'
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 3,
          delay: 2,
          ease: [0, 0.71, 0.2, 1.01],
        }}
      >
        <h1
          className='text-[12rem] uppercase font-codac-brand bg-gradient-to-br from-[#E77096] to-[#52EACE] bg-clip-text text-transparent'
          style={{ WebkitTextStroke: '4px white' }}
        >
          codac
        </h1>
      </motion.div>

      <motion.div
        className='animate-diamond-pulse opacity-0'
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        transition={{
          duration: 3,
          delay: 2,
          ease: [0, 0.71, 0.2, 1.01],
        }}
      >
        <CodacRightAngleBracket size='6xl' animated />
      </motion.div>
    </div>
  );
}
