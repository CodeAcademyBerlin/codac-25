import { PageContainer, PageHeader } from '@/components/layout'
import { ProjectsClient } from '@/components/projects/projects-client'
import { getAllProjects } from '@/data/projects/get-projects'

// Dynamic rendering to support user-specific like states
export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  // Load all projects with user-specific like status
  const projects = await getAllProjects({})

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        description="Discover amazing projects built by our community of students"
        size="lg"
      />

      <ProjectsClient initialProjects={projects} />
    </PageContainer>
  )
}