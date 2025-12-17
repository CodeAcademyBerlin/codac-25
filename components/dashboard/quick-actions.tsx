import { Plus, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Get started with common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Button
            asChild
            variant='outline'
            className='h-auto flex-col gap-2 p-6'
          >
            <Link href='/projects/create'>
              <Plus className='h-8 w-8 text-primary' />
              <div className='text-center'>
                <div className='font-medium'>Create Project</div>
                <div className='text-xs text-muted-foreground'>
                  Start a new project
                </div>
              </div>
            </Link>
          </Button>

          <Button
            asChild
            variant='outline'
            className='h-auto flex-col gap-2 p-6'
          >
            <Link href='/projects'>
              <Trophy className='h-8 w-8 text-chart-2' />
              <div className='text-center'>
                <div className='font-medium'>Browse Projects</div>
                <div className='text-xs text-muted-foreground'>
                  Explore community work
                </div>
              </div>
            </Link>
          </Button>

          <Button
            asChild
            variant='outline'
            className='h-auto flex-col gap-2 p-6'
          >
            <Link href='/community'>
              <Users className='h-8 w-8 text-chart-3' />
              <div className='text-center'>
                <div className='font-medium'>Join Community</div>
                <div className='text-xs text-muted-foreground'>
                  Connect with others
                </div>
              </div>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}











