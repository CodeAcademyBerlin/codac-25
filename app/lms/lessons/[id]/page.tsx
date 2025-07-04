import { notFound } from 'next/navigation';
import { Value } from 'platejs';

import { DndWrapper } from '@/app/docs/components/dnd-wrapper';
import { getLesson } from '@/data/lms/courses';
import { getCurrentUser } from '@/lib/auth/auth-utils';

import { LessonContent } from '../components/lesson-content';

// Utility function to transform lesson content to Plate editor format
function transformLessonContent(content: any): Value {
    // If content is already a valid Plate format (array), return it
    if (Array.isArray(content)) {
        return content;
    }

    // If content is null or undefined, return default empty content
    if (!content) {
        return [
            {
                type: 'p',
                children: [{ text: '' }]
            }
        ];
    }

    // Handle different content types from seed data
    if (typeof content === 'object' && content.type) {
        switch (content.type) {
            case 'interactive':
                return [
                    {
                        type: 'h2',
                        children: [{ text: 'Interactive Exercise' }]
                    },
                    {
                        type: 'p',
                        children: [{ text: 'This lesson contains interactive exercises:' }]
                    },
                    ...content.exercises?.map((exercise: any, index: number) => [
                        {
                            type: 'h3',
                            children: [{ text: `Question ${index + 1}` }]
                        },
                        {
                            type: 'p',
                            children: [{ text: exercise.question }]
                        },
                        {
                            type: 'blockquote',
                            children: [{ text: `Answer: ${exercise.answer}` }]
                        }
                    ]).flat() || []
                ];

            case 'video':
                return [
                    {
                        type: 'h2',
                        children: [{ text: 'Video Lesson' }]
                    },
                    {
                        type: 'p',
                        children: [{ text: content.videoUrl ? `Video: ${content.videoUrl}` : 'Video content will be available here.' }]
                    },
                    ...(content.transcript ? [
                        {
                            type: 'h3',
                            children: [{ text: 'Transcript' }]
                        },
                        {
                            type: 'p',
                            children: [{ text: content.transcript }]
                        }
                    ] : [])
                ];

            case 'text':
                return [
                    {
                        type: 'p',
                        children: [{ text: content.markdown || content.text || 'No content available.' }]
                    }
                ];

            default:
                return [
                    {
                        type: 'p',
                        children: [{ text: 'Content format not supported yet.' }]
                    }
                ];
        }
    }

    // Fallback for any other format
    return [
        {
            type: 'p',
            children: [{ text: 'Unable to display content.' }]
        }
    ];
}

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
                        content: transformLessonContent(lesson.content)
                    }}
                    user={user}
                    canEdit={canEditLesson}
                />
            </div>
        </DndWrapper>
    );
} 