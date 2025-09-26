import { Project } from '@prisma/client';
import { notFound } from 'next/navigation';
import { Value } from 'platejs';
import { Suspense } from 'react';

import ProjectContent from '@/components/projects/project-content';
import { getProjectById } from '@/data/projects/get-project-by-id';
import { requireServerAuth } from '@/lib/auth/auth-server';

import { updateProjectSummary } from '../../../../../actions/projects/update-project-summary';


interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectEditPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const projectPromise = getProjectById(id) as Promise<Project>;



  if (!projectPromise) {
    notFound();
  }

  // const isOwner = user?.id === project.projectProfile.userId;
  // if (!isOwner) {
  //   notFound();
  // }

  // const plateValue = jsonToPlateValue(project.summary);

  // Server action wrapper for saving
  // const handleSave = async (value: Value) => {
  //   const result = await updateProjectSummary(id, value);
  //   if (!result.success) {
  //     throw new Error(
  //       typeof result.error === 'string'
  //         ? result.error
  //         : 'Failed to save project'
  //     );
  //   }
  // };

  return (
    <div className='min-h-screen bg-background'>
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectContent _projectPromise={projectPromise} />
      </Suspense>

      {/* <ProjectEditorOptimized
        initialValue={plateValue}
        projectId={id}
        onSave={handleSave}
        autoSave={true}
        autoSaveInterval={30000}
        showBackButton={true}
        backLink={`/projects/${id}`}
      /> */}
    </div>
  );
}
