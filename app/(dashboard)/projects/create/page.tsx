import { redirect } from 'next/navigation'

import { createProject } from '@/actions/projects/create-project'
import { DndWrapper } from '@/app/(dashboard)/docs/components/dnd-wrapper'
import { PageContainer, PageHeader } from '@/components/layout'
import { ProjectFormWithSummary } from '@/components/projects/project-form-with-summary'
import { getCurrentUser } from '@/lib/auth/auth-utils'
import type { CreateProjectData } from '@/types/portfolio'

export default async function CreateProjectPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/projects/create')
  }

  const handleCreateProject = async (data: CreateProjectData) => {
    'use server'

    try {
      const result = await createProject(data)

      if (result.success) {
        redirect(`/projects/${result.data.id}/edit`)
      } else {
        // Handle error - properly return error to be displayed
        console.error('Failed to create project:', result.error)
        return { error: result.error as string }
      }
    } catch (error) {
      console.error('Exception when creating project:', error)
      return { error: 'An unexpected error occurred. Please try again.' }
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