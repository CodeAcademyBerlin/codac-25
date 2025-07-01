import { notFound } from 'next/navigation';
import { Value } from 'platejs';

import { DndWrapper } from '@/app/docs/components/dnd-wrapper';
import { getLesson } from '@/data/lms/courses';
import { getCurrentUser } from '@/lib/auth/auth-utils';

import { LessonContent } from '../components/lesson-content';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        notFound();
    }

    const lesson = await getLesson(id);

    if (!lesson) {
        notFound();
    }

    // Edit mode is only available for mentors and admins
    const canEditLesson = ['ADMIN', 'MENTOR'].includes(user.role);

    return (
        <DndWrapper>
            <div className="h-full">
                <LessonContent
                    lesson={{
                        ...lesson,
                        content: (lesson.content as Value) || []
                    }}
                    user={user}
                    canEdit={canEditLesson}
                />
            </div>
        </DndWrapper>
    );
} 