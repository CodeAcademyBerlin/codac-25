import { Search, Grid, List } from 'lucide-react'

import { Grid as LayoutGrid, PageContainer, PageHeader, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectCard } from '@/components/projects/project-card'
import { ProjectsFilter } from '@/components/projects/projects-filter'
import { getAllProjects } from '@/data/projects/get-projects'
import type { ProjectStatus } from '@prisma/client'

interface ProjectsPageProps {
  searchParams?: Promise<{
    search?: string
    tech?: string
    status?: string
    featured?: string
  }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams
  const projects = await getAllProjects({
    search: params?.search,
    techStack: params?.tech?.split(','),
    status: params?.status?.split(',') as ProjectStatus[],
    featured: params?.featured === 'true',
  })

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        description="Discover amazing projects built by our community of students"
        size="lg"
      />

      <Section>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                defaultValue={params?.search}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProjectsFilter />
            <div className="flex items-center rounded-md border p-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">No projects found</div>
            <p className="text-muted-foreground">
              {params?.search || params?.tech || params?.status
                ? "Try adjusting your search criteria"
                : "Be the first to share a project with the community!"}
            </p>
          </div>
        ) : (
          <LayoutGrid cols="3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </LayoutGrid>
        )}
      </Section>
    </PageContainer>
  )
}