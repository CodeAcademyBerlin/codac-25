import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  return (
    <div className='flex justify-end mb-6'>
      <Link href='/projects/create'>
        <Button variant='brandGradient'>
          <Plus className='h-4 w-4 mr-2' />
          New Project
        </Button>
      </Link>
    </div>
  );
}
