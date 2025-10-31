import Link from 'next/link';

import { ProjectCard } from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import { getFeaturedProjects } from '@/data/projects/get-projects';

export const dynamic = 'force-dynamic';

export default async function FeaturedProjectsSlot() {
  let featuredProjects: Awaited<ReturnType<typeof getFeaturedProjects>> = [];

  try {
    featuredProjects = await getFeaturedProjects(3);
  } catch (error) {
    console.error('Error loading featured projects:', error);
  }

  if (featuredProjects.length === 0) {
    return null;
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Featured Projects
          </h2>
          <p className='text-muted-foreground'>
            Discover amazing work from the community
          </p>
        </div>
        <Link href='/showcase'>
          <Button variant='outline'>View Showcase</Button>
        </Link>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {featuredProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
