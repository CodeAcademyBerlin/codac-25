import { notFound } from 'next/navigation';
import { Value } from 'platejs';

import { DndWrapper } from '@/app/docs/components/dnd-wrapper';
import { getLesson, canEditCourse } from '@/data/lms/courses';
import { getCurrentUser } from '@/lib/auth/auth-utils';

import { LessonContent } from '../components/lesson-content';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        notFound();
    }

    const [lesson, canEdit] = await Promise.all([
        getLesson(id),
        canEditCourse(''), // We'll pass the course ID from lesson data
    ]);

    if (!lesson) {
        notFound();
    }

    const canEditLesson = canEdit || ['ADMIN', 'MENTOR'].includes(user.role);

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