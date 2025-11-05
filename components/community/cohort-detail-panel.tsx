'use client';

import Image from 'next/image';
import type { Cohort, User } from '@/types/cohort';
import { CohortMembersList } from './cohort-members-list';

interface CohortDetailPanelProps {
  cohort: Cohort;
  members: User[];
  currentIndex: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

export function CohortDetailPanel({
  cohort,
  members,
  currentIndex,
  totalCount,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onClose,
}: CohortDetailPanelProps) {
  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      {/* Cohort Header */}
      <div className='p-6 border-b border-white/10'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex-1'>
            <h2 className='text-2xl font-bold text-white mb-2'>
              {cohort.name}
            </h2>
            {cohort.startDate && cohort.endDate && (
              <p className='text-slate-400 text-sm'>
                {cohort.startDate.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                -{' '}
                {cohort.endDate.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
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
            width={400}
            height={128}
            src={`/${cohort.image}`}
            alt={cohort.name}
            className='w-full h-full object-cover rounded-lg'
          />
        </div>
      </div>

      {/* Members List */}
      <CohortMembersList members={members} fallbackImage={cohort.image || '/default-cohort.png'} />

      {/* Navigation Footer */}
      <div className='p-4 border-t border-white/10 flex items-center justify-between'>
        <button
          onClick={onPrevious}
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
          {currentIndex + 1} / {totalCount}
        </span>
        <button
          onClick={onNext}
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
  );
}

