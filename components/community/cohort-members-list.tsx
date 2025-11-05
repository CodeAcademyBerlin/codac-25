'use client';

import Image from 'next/image';
import type { User } from '@/types/cohort';

interface CohortMembersListProps {
  members: User[];
  fallbackImage: string;
}

export function CohortMembersList({
  members,
  fallbackImage,
}: CohortMembersListProps) {
  return (
    <div className='flex-1 overflow-y-auto p-6'>
      <h3 className='text-lg font-semibold text-white mb-4'>
        Members ({members.length})
      </h3>
      <div className='space-y-3'>
        {members.map(user => (
          <div
            key={user.username}
            className='flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors'
          >
            <Image
              width={40}
              height={40}
              src={`/${user.image || fallbackImage}`}
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
  );
}

