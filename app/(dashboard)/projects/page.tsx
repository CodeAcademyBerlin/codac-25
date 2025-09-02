import { PageContainer, PageHeader } from '@/components/layout'
import { ProjectsClient } from '@/components/projects/projects-client'
import { getAllProjects } from '@/data/projects/get-projects'

// Force static generation (SSG - no revalidation)
export const dynamic = 'force-static'

export default async function ProjectsPage() {
  // For static generation, we'll load all projects at build time
  // All filtering will be handled client-side
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