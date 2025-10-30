import { Code, Plus } from 'lucide-react';
import Link from 'next/link';

import { SectionErrorBoundary } from '@/components/error/section-error-boundary';
import { Grid, Section } from '@/components/layout';
import { ProjectCard } from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getUserProjects } from '@/data/projects/get-projects';

export const dynamic = 'force-dynamic';

export default async function MyProjectsSlot() {
  let userProjects: Awaited<ReturnType<typeof getUserProjects>> = [];

  try {
    userProjects = await getUserProjects();
  } catch (error) {
    console.error('Error loading user projects:', error);
  }

  return (
    <Section>
      <SectionErrorBoundary sectionName='my projects'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>My Projects</h2>
            <p className='text-muted-foreground'>Your latest project work</p>
          </div>
          <Link href='/projects/my'>
            <Button variant='outline'>View All</Button>
          </Link>
        </div>

        {userProjects.length > 0 ? (
          <Grid cols='3'>
            {userProjects.slice(0, 3).map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                showEditActions={true}
              />
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent className='flex flex-col items-center justify-center p-12'>
              <Code className='h-16 w-16 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No projects yet</h3>
              <p className='text-muted-foreground text-center mb-6'>
                Start building your portfolio by creating your first project
              </p>
              <Link href='/projects/create'>
                <Button variant='brandGradient'>
                  <Plus className='h-4 w-4 mr-2' />
                  Create Your First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </SectionErrorBoundary>
    </Section>
  );
}
