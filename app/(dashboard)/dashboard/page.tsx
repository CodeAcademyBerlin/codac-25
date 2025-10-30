import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getUser } from '@/data/user/get-user';
import { requireServerAuth } from '@/lib/auth/auth-server';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const authUser = await requireServerAuth();

  const result = await getUser(authUser.id);

  if (!result.success || !result.data) {
    // User has valid session but no database record - redirect to signout to clear session
    redirect('/auth/signout?callbackUrl=/auth/signin');
  }

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
