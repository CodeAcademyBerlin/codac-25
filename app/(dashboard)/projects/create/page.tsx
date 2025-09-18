import { redirect } from 'next/navigation'

import { createProject } from '@/actions/projects/create-project'
import { DndWrapper } from '@/components/dnd/dnd-wrapper'
import { PageContainer, PageHeader } from '@/components/layout'
import { ProjectFormWithSummary } from '@/components/projects/project-form-with-summary'
import type { CreateProjectData } from '@/types/portfolio'

export default async function CreateProjectPage() {

  const handleCreateProject = async (data: CreateProjectData) => {
    'use server'

    let result;

    try {
      result = await createProject(data)
    } catch (error) {
      console.error('Exception when creating project:', error)
      return { error: 'An unexpected error occurred. Please try again.' }
    }

    if (result.success) {
      // Redirect is now outside try-catch to avoid catching NEXT_REDIRECT
      redirect(`/projects/${result.data.id}`)
    } else {
      // Handle error - properly return error to be displayed
      console.error('Failed to create project:', result.error)
      return { error: result.error as string }
    }
  }

  return (
    <DndWrapper>
      <PageContainer size="lg">
        <PageHeader
          title="Create New Project"
          description="Share your work with the community and build your portfolio"
          size="lg"
        />

        <ProjectFormWithSummary
          onSubmit={handleCreateProject}
          isLoading={false}
        />
      </PageContainer>
    </DndWrapper>
  )
}