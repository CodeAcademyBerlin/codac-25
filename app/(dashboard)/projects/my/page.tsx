import { Plus } from 'lucide-react'
import Link from 'next/link'

import { Grid, PageContainer, PageHeader, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/project-card'
import { getUserProjects } from '@/data/projects/get-user-projects'
import { getCurrentUser } from '@/lib/auth/auth-utils'

export default async function MyProjectsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <div className="text-lg mb-4">Please sign in to view your projects</div>
        </div>
      </PageContainer>
    )
  }

  const projects = await getUserProjects(user.id)

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <PageHeader
          title="My Projects"
          description="Manage and showcase your project portfolio"
          size="lg"
        />
        <Link href="/projects/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <Section>
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg mb-4">No projects yet</div>
            <p className="text-muted-foreground mb-6">
              Start building your portfolio by creating your first project
            </p>
            <Link href="/projects/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </Link>
          </div>
        ) : (
          <Grid cols="3">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                showEditActions={true}
              />
            ))}
          </Grid>
        )}
      </Section>
    </PageContainer>
  )
}