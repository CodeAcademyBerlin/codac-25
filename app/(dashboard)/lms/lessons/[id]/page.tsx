import { notFound } from 'next/navigation';
import { Value } from 'platejs';

import { DndWrapper } from '@/components/dnd/dnd-wrapper';
import { getLesson, getLessonNavigation } from '@/data/lms/courses';
import { getCurrentUser } from '@/lib/auth/auth-utils';

import { LessonContent } from '../components/lesson-content';

// Content type interfaces
interface Exercise {
    question: string;
    answer: string;
}

interface InteractiveContent {
    type: 'interactive';
    exercises?: Exercise[];
}

interface VideoContent {
    type: 'video';
    videoUrl?: string;
    transcript?: string;
}

interface TextContent {
    type: 'text';
    markdown?: string;
    text?: string;
}

type LessonContentType = InteractiveContent | VideoContent | TextContent | { type: string };

// Utility function to transform lesson content to Plate editor format
function transformLessonContent(content: unknown): Value {
    // If content is a JSON string, parse it first
    if (typeof content === 'string') {
        try {
            content = JSON.parse(content);
        } catch {
            // If parsing fails, treat as plain text
            return [
                {
                    type: 'p',
                    children: [{ text: content as string }]
                }
            ];
        }
    }

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
    if (typeof content === 'object' && content !== null && 'type' in content) {
        const typedContent = content as LessonContentType;
        switch (typedContent.type) {
            case 'interactive':
                const interactiveContent = typedContent as InteractiveContent;
                return [
                    {
                        type: 'h2',
                        children: [{ text: 'Interactive Exercise' }]
                    },
                    {
                        type: 'p',
                        children: [{ text: 'This lesson contains interactive exercises:' }]
                    },
                    ...interactiveContent.exercises?.map((exercise: Exercise, index: number) => [
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
                const videoContent = typedContent as VideoContent;
                return [
                    {
                        type: 'h2',
                        children: [{ text: 'Video Lesson' }]
                    },
                    {
                        type: 'p',
                        children: [{ text: videoContent.videoUrl ? `Video: ${videoContent.videoUrl}` : 'Video content will be available here.' }]
                    },
                    ...(videoContent.transcript ? [
                        {
                            type: 'h3',
                            children: [{ text: 'Transcript' }]
                        },
                        {
                            type: 'p',
                            children: [{ text: videoContent.transcript }]
                        }
                    ] : [])
                ];

            case 'text':
                const textContent = typedContent as TextContent;
                return [
                    {
                        type: 'p',
                        children: [{ text: textContent.markdown || textContent.text || 'No content available.' }]
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

    // Get navigation data for previous/next lessons
    const navigation = await getLessonNavigation(id);

    // Edit mode is only available for mentors and admins
    const canEditLesson = ['ADMIN', 'MENTOR'].includes(user.role);

    return (
        <DndWrapper>

            <LessonContent
                lesson={{
                    ...lesson,
                    content: transformLessonContent(lesson.content)
                }}
                user={user}
                canEdit={canEditLesson}
                navigation={navigation}
            />
        </DndWrapper>
    );
} 