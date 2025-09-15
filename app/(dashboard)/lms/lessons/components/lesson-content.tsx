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
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { updateLessonProgress } from '@/actions/lms/update-lesson';
import { SimplifiedUnifiedEditor } from '@/components/editor/simplified-unified-editor';
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

interface NavigationLesson {
    id: string;
    title: string;
    order: number;
}

interface LessonNavigation {
    previousLesson: NavigationLesson | null;
    nextLesson: NavigationLesson | null;
}

interface LessonContentProps {
    lesson: Lesson;
    user: User;
    canEdit: boolean;
    navigation: LessonNavigation;
}

export function LessonContent({ lesson, user: _user, canEdit, navigation }: LessonContentProps) {
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

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle navigation if not in edit mode and not typing in an input
            if (isEditing || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (event.key === 'ArrowLeft' && navigation.previousLesson) {
                event.preventDefault();
                router.push(`/lms/lessons/${navigation.previousLesson.id}`);
            } else if (event.key === 'ArrowRight' && navigation.nextLesson) {
                event.preventDefault();
                router.push(`/lms/lessons/${navigation.nextLesson.id}`);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigation, isEditing, router]);

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
            {/* <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 gap-4">
                  <div className="flex items-center space-x-2 lg:space-x-4 min-w-0">
                        <Link href={`/lms/courses/${lesson.project.course.id}`}>
                            <Button variant="ghost" size="sm" className="shrink-0">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Back to Course</span>
                                <span className="sm:hidden">Back</span>
                            </Button>
                        </Link>

                        <Separator orientation="vertical" className="h-6 hidden lg:block" />

                        <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-sm text-muted-foreground truncate">
                                <span className="hidden sm:inline">{lesson.project.course.title} / {lesson.project.title}</span>
                                <span className="sm:hidden">{lesson.project.title}</span>
                            </span>
                        </div>
                    </div> 

                    <div className="flex items-center space-x-1 lg:space-x-2 flex-wrap gap-2">
                        {canEdit && (
                            <Button
                                variant={isEditing ? "default" : "outline"}
                                size="sm"
                                onClick={toggleEditMode}
                                className="hidden lg:flex"
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

                        <Badge variant="outline" className={`${getStatusColor(currentStatus)} shrink-0`}>
                            {getStatusIcon(currentStatus)}
                            <span className="ml-1 capitalize hidden sm:inline">
                                {currentStatus.toLowerCase().replace('_', ' ')}
                            </span>
                            <span className="ml-1 capitalize sm:hidden">
                                {currentStatus === 'NOT_STARTED' ? 'New' :
                                    currentStatus === 'IN_PROGRESS' ? 'Active' : 'Done'}
                            </span>
                        </Badge>

                        {lesson.duration && (
                            <Badge variant="outline" className="shrink-0">
                                <Clock className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">{lesson.duration}min</span>
                                <span className="sm:hidden">{lesson.duration}m</span>
                            </Badge>
                        )}

                        <Badge variant="secondary" className="shrink-0">
                            <span className="hidden sm:inline">{lesson.type}</span>
                            <span className="sm:hidden">{lesson.type.charAt(0)}</span>
                        </Badge>

                        {isEditing && (
                            <Badge variant="default" className="bg-blue-500 shrink-0">
                                <Edit3 className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Editing</span>
                                <span className="sm:hidden">Edit</span>
                            </Badge>
                        )}
                    </div>
                </div>
            </div> */}

            {/* Lesson Header */}
            <div className="border-b p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl lg:text-2xl font-bold break-words">{lesson.title}</h1>
                        {lesson.description && (
                            <p className="text-muted-foreground mt-2 break-words">{lesson.description}</p>
                        )}
                    </div>

                    {/* Progress Actions - Hidden on mobile (moved to bottom bar) */}
                    <div className="hidden lg:flex items-center gap-2">
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
                <div className="flex-1 overflow-y-auto pb-24 lg:pb-6">
                    <div className="h-full">
                        <div className={isEditing ? "h-full" : "prose prose-neutral dark:prose-invert max-w-none"}>
                            <SimplifiedUnifiedEditor
                                contentId={lesson.id}
                                contentType="lesson"
                                initialValue={lesson.content}
                                showStatusBar={isEditing}
                                canEdit={isEditing}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar - Hidden on mobile */}
                <div className="hidden lg:block w-80 border-l bg-muted/30 overflow-y-auto">
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
                                    {navigation.previousLesson ? (
                                        <Link href={`/lms/lessons/${navigation.previousLesson.id}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start hover:bg-muted/50 transition-colors"
                                                title={`Previous: ${navigation.previousLesson.title}`}
                                            >
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                <span className="truncate">{navigation.previousLesson.title}</span>
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start"
                                            disabled
                                            title="No previous lesson"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Previous Lesson
                                        </Button>
                                    )}

                                    {navigation.nextLesson ? (
                                        <Link href={`/lms/lessons/${navigation.nextLesson.id}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start hover:bg-muted/50 transition-colors"
                                                title={`Next: ${navigation.nextLesson.title}`}
                                            >
                                                <ArrowRight className="h-4 w-4 mr-2" />
                                                <span className="truncate">{navigation.nextLesson.title}</span>
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start"
                                            disabled
                                            title="No next lesson"
                                        >
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Next Lesson
                                        </Button>
                                    )}
                                </div>

                                {/* Keyboard shortcut hint */}
                                <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                                    💡 Use ← → arrow keys to navigate
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Button Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-3 z-50 safe-area-pb">
                <div className="flex items-center justify-between gap-1 max-w-full">
                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1">
                        {navigation.previousLesson ? (
                            <Link href={`/lms/lessons/${navigation.previousLesson.id}`}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 px-2"
                                    title={`Previous: ${navigation.previousLesson.title}`}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden xs:inline text-xs">Prev</span>
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="flex items-center gap-1 px-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden xs:inline text-xs">Prev</span>
                            </Button>
                        )}

                        {navigation.nextLesson ? (
                            <Link href={`/lms/lessons/${navigation.nextLesson.id}`}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 px-2"
                                    title={`Next: ${navigation.nextLesson.title}`}
                                >
                                    <span className="hidden xs:inline text-xs">Next</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="flex items-center gap-1 px-2"
                            >
                                <span className="hidden xs:inline text-xs">Next</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Progress Actions */}
                    <div className="flex items-center gap-1">
                        {currentStatus === 'NOT_STARTED' && (
                            <Button
                                onClick={() => handleProgressUpdate('IN_PROGRESS')}
                                disabled={isUpdatingProgress}
                                size="sm"
                                className="flex items-center gap-1 px-3 bg-green-600 hover:bg-green-700"
                            >
                                <Play className="h-4 w-4" />
                                <span className="text-xs font-medium">Start</span>
                            </Button>
                        )}

                        {currentStatus === 'IN_PROGRESS' && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => handleProgressUpdate('NOT_STARTED')}
                                    disabled={isUpdatingProgress}
                                    size="sm"
                                    className="flex items-center gap-1 px-2"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    <span className="hidden xs:inline text-xs">Reset</span>
                                </Button>
                                <Button
                                    onClick={() => handleProgressUpdate('COMPLETED')}
                                    disabled={isUpdatingProgress}
                                    size="sm"
                                    className="flex items-center gap-1 px-3 bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-xs font-medium">Complete</span>
                                </Button>
                            </>
                        )}

                        {currentStatus === 'COMPLETED' && (
                            <Button
                                variant="outline"
                                onClick={() => handleProgressUpdate('IN_PROGRESS')}
                                disabled={isUpdatingProgress}
                                size="sm"
                                className="flex items-center gap-1 px-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                <span className="hidden xs:inline text-xs">Reset</span>
                            </Button>
                        )}

                        {/* Edit Mode Toggle */}
                        {canEdit && (
                            <Button
                                variant={isEditing ? "default" : "outline"}
                                size="sm"
                                onClick={toggleEditMode}
                                className="flex items-center gap-1 px-2"
                            >
                                {isEditing ? (
                                    <Eye className="h-4 w-4" />
                                ) : (
                                    <Edit3 className="h-4 w-4" />
                                )}
                                <span className="hidden xs:inline text-xs">
                                    {isEditing ? 'View' : 'Edit'}
                                </span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 