import { Code2 } from 'lucide-react';
import Link from 'next/link';

import { ProjectCard } from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/auth-utils';
import { getUserProjects } from '@/data/projects/get-projects';

export async function RecentProjects() {
  // Check if user is authenticated before fetching projects
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Your Recent Projects
            </h2>
            <p className='text-muted-foreground'>
              Projects you've been working on
            </p>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center py-12 rounded-lg border border-dashed'>
          <Code2 className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>Sign in to see your projects</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Create an account or sign in to start building
          </p>
        </div>
      </div>
    );
  }

  let projects = await getUserProjects();
  
  // Take only the 3 most recent projects
  projects = projects.slice(0, 3);

  if (projects.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Your Recent Projects
            </h2>
            <p className='text-muted-foreground'>
              Projects you've been working on
            </p>
          </div>
          <Link href='/projects/my'>
            <Button variant='outline'>View All</Button>
          </Link>
        </div>

        <div className='flex flex-col items-center justify-center py-12 rounded-lg border border-dashed'>
          <Code2 className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No projects yet</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Start building something amazing
          </p>
          <Link href='/projects/create'>
            <Button>Create Your First Project</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Your Recent Projects
          </h2>
          <p className='text-muted-foreground'>Projects you've been working on</p>
        </div>
        <Link href='/projects/my'>
          <Button variant='outline'>View All</Button>
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} showEditActions />
        ))}
      </div>
    </div>
  );
}

