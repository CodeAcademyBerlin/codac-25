'use client';

import {
    BookOpen,
    CheckCircle2,
    Clock,
    ArrowLeft,
    ArrowRight,
    Play,
    RotateCcw,
    Edit3,
    Eye
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Value } from 'platejs';
import { useState } from 'react';
import { toast } from 'sonner';

import { updateLessonProgress } from '@/actions/lms/update-lesson';
import { UnifiedEditor } from '@/components/editor/unified-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface Lesson {
    id: string;
    title: string;
    description?: string | null;
    content: Value;
    type: string;
    duration?: number | null;
    project: {
        id: string;
        title: string;
        course: {
            id: string;
            title: string;
        };
    };
    progress: Array<{
        status: string;
        startedAt?: Date | null;
        completedAt?: Date | null;
    }>;
    assignments: Array<{
        id: string;
        title: string;
        description: string;
        submissions: Array<{
            id: string;
            status: string;
        }>;
    }>;
    resources: Array<{
        id: string;
        title: string;
        url: string;
        type: string;
    }>;
}

interface User {
    id: string;
    name?: string | null;
    role: string;
}

interface LessonContentProps {
    lesson: Lesson;
    user: User;
    canEdit: boolean;
}

export function LessonContent({ lesson, user: _user, canEdit }: LessonContentProps) {
    const router = useRouter();
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(
        lesson.progress[0]?.status || 'NOT_STARTED'
    );
    const [isEditing, setIsEditing] = useState(false);

    const handleProgressUpdate = async (status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
        setIsUpdatingProgress(true);
        try {
            const result = await updateLessonProgress(lesson.id, status);
            if (result.success) {
                setCurrentStatus(status);
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Failed to update progress');
        } finally {
            setIsUpdatingProgress(false);
        }
    };

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-green-500';
            case 'IN_PROGRESS': return 'text-blue-500';
            default: return 'text-muted-foreground';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="h-4 w-4" />;
            case 'IN_PROGRESS': return <Clock className="h-4 w-4" />;
            default: return <Play className="h-4 w-4" />;
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                        <Link href={`/lms/courses/${lesson.project.course.id}`}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Course
                            </Button>
                        </Link>

                        <Separator orientation="vertical" className="h-6" />

                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {lesson.project.course.title} / {lesson.project.title}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Edit Mode Toggle */}
                        {canEdit && (
                            <Button
                                variant={isEditing ? "default" : "outline"}
                                size="sm"
                                onClick={toggleEditMode}
                            >
                                {isEditing ? (
                                    <>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Exit Edit
                                    </>
                                ) : (
                                    <>
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Edit Content
                                    </>
                                )}
                            </Button>
                        )}

                        <Badge variant="outline" className={getStatusColor(currentStatus)}>
                            {getStatusIcon(currentStatus)}
                            <span className="ml-1 capitalize">
                                {currentStatus.toLowerCase().replace('_', ' ')}
                            </span>
                        </Badge>

                        {lesson.duration && (
                            <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                {lesson.duration}min
                            </Badge>
                        )}

                        <Badge variant="secondary">
                            {lesson.type}
                        </Badge>

                        {isEditing && (
                            <Badge variant="default" className="bg-blue-500">
                                <Edit3 className="h-3 w-3 mr-1" />
                                Editing
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Lesson Header */}
            <div className="border-b p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{lesson.title}</h1>
                        {lesson.description && (
                            <p className="text-muted-foreground mt-2">{lesson.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {currentStatus === 'NOT_STARTED' && (
                            <Button
                                onClick={() => handleProgressUpdate('IN_PROGRESS')}
                                disabled={isUpdatingProgress}
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Start Lesson
                            </Button>
                        )}

                        {currentStatus === 'IN_PROGRESS' && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => handleProgressUpdate('NOT_STARTED')}
                                    disabled={isUpdatingProgress}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                                <Button
                                    onClick={() => handleProgressUpdate('COMPLETED')}
                                    disabled={isUpdatingProgress}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark Complete
                                </Button>
                            </>
                        )}

                        {currentStatus === 'COMPLETED' && (
                            <Button
                                variant="outline"
                                onClick={() => handleProgressUpdate('IN_PROGRESS')}
                                disabled={isUpdatingProgress}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Mark Incomplete
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        <div className={isEditing ? "h-full" : "prose prose-neutral dark:prose-invert max-w-none"}>
                            <UnifiedEditor
                                contentId={lesson.id}
                                contentType="lesson"
                                initialValue={lesson.content}
                                showStatusBar={isEditing}
                                canEdit={isEditing}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 border-l bg-muted/30 overflow-y-auto">
                    <div className="p-4 space-y-4">
                        {/* Edit Mode Info */}
                        {canEdit && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Content Editing</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="text-xs text-muted-foreground">
                                            Mode: {isEditing ? 'Editing' : 'Viewing'}
                                        </div>
                                        <Button
                                            variant={isEditing ? "outline" : "default"}
                                            size="sm"
                                            onClick={toggleEditMode}
                                            className="w-full"
                                        >
                                            {isEditing ? (
                                                <>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Switch to View
                                                </>
                                            ) : (
                                                <>
                                                    <Edit3 className="h-4 w-4 mr-2" />
                                                    Edit Content
                                                </>
                                            )}
                                        </Button>
                                        {isEditing && (
                                            <div className="text-xs text-muted-foreground">
                                                💡 Changes are automatically saved
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {lesson.progress[0]?.startedAt && (
                                        <div className="text-xs text-muted-foreground">
                                            Started: {new Date(lesson.progress[0].startedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                    {lesson.progress[0]?.completedAt && (
                                        <div className="text-xs text-muted-foreground">
                                            Completed: {new Date(lesson.progress[0].completedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                    <Progress
                                        value={currentStatus === 'COMPLETED' ? 100 : currentStatus === 'IN_PROGRESS' ? 50 : 0}
                                        className="h-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resources */}
                        {lesson.resources.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Resources</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {lesson.resources.map((resource) => (
                                            <a
                                                key={resource.id}
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-2 rounded hover:bg-muted/50 text-sm"
                                            >
                                                <div className="font-medium">{resource.title}</div>
                                                <div className="text-xs text-muted-foreground capitalize">
                                                    {resource.type}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Assignments */}
                        {lesson.assignments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Assignments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {lesson.assignments.map((assignment) => {
                                            const submission = assignment.submissions[0];
                                            return (
                                                <div key={assignment.id} className="p-2 rounded border">
                                                    <div className="font-medium text-sm">{assignment.title}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {assignment.description}
                                                    </div>
                                                    {submission && (
                                                        <Badge variant="outline" className="mt-2 text-xs">
                                                            {submission.status}
                                                        </Badge>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Navigation */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Navigation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Previous Lesson
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        Next Lesson
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
} 