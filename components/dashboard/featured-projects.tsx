import { Trophy } from 'lucide-react';
import Link from 'next/link';

import { ProjectCard } from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import { getFeaturedProjects } from '@/data/projects/get-projects';

export async function FeaturedProjects() {
  const featuredProjects = await getFeaturedProjects(3);

  if (featuredProjects.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
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

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {featuredProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

