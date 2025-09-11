import { notFound, redirect } from 'next/navigation'
import { Value } from 'platejs'

import { updateProject } from '@/actions/projects/update-project'
import { DndWrapper } from '@/components/dnd/dnd-wrapper'
import { PageContainer, PageHeader } from '@/components/layout'
import { ProjectFormWithSummary } from '@/components/projects/project-form-with-summary'
import { getProjectById } from '@/data/projects/get-project-by-id'
import { getCurrentUser } from '@/lib/auth/auth-utils'
import type { CreateProjectData } from '@/types/portfolio'

interface EditProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params
  const [user, project] = await Promise.all([
    getCurrentUser(),
    getProjectById(id)
  ])

  if (!user) {
    redirect('/auth/signin?callbackUrl=/projects/' + id + '/edit')
  }

  if (!project) {
    notFound()
  }

  // Check if user owns this project
  if (project.projectProfile.userId !== user.id) {
    redirect('/projects/' + id)
  }

  const handleUpdateProject = async (data: CreateProjectData) => {
    'use server'

    const result = await updateProject(id, data)

    if (result.success) {
      redirect(`/projects/${id}`)
    } else {
      // Handle error - in a real app, you'd want to show this to the user
      console.error('Failed to update project:', result.error)
    }
  }

  // Convert project data for form
  const initialData: Partial<CreateProjectData> = {
    title: project.title,
    description: project.description,
    shortDesc: project.shortDesc || undefined,
    demoUrl: project.demoUrl || undefined,
    githubUrl: project.githubUrl || undefined,
    techStack: project.techStack as string[],
    features: project.features as string[] | undefined,
    challenges: project.challenges || undefined,
    solutions: project.solutions || undefined,
    status: project.status,
    startDate: project.startDate || undefined,
    endDate: project.endDate || undefined,
    isPublic: project.isPublic,
  }

  return (
    <DndWrapper>
      <PageContainer size="lg" padding="sm">
        <PageHeader
          title="Edit Project"
          description="Update your project details and summary"
          size="lg"
        />

        <ProjectFormWithSummary
          projectId={project.id}
          initialData={initialData}
          initialSummary={project.summary as Value}
          onSubmit={handleUpdateProject}
          isLoading={false}
        />
      </PageContainer>
    </DndWrapper>
  )
}