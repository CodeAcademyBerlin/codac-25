'use client';

export function EmptyState() {
  return (
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
        Click on any cohort card in the 3D space to view its details and
        members.
      </p>
    </div>
  );
}

