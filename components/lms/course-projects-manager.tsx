'use client';

import { Plus, Settings, BookOpen, Trash2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { createLesson, updateLessonDetails, deleteLesson } from '@/actions/lms/create-lesson';
import { createProject, updateProject, deleteProject } from '@/actions/lms/create-project';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Course {
    id: string;
    title: string;
    projects: Array<{
        id: string;
        title: string;
        description?: string | null;
        duration?: number | null;
        isPublished: boolean;
        lessons: Array<{
            id: string;
            title: string;
            description?: string | null;
            type: string;
            duration?: number | null;
            isPublished: boolean;
        }>;
        _count: {
            lessons: number;
        };
    }>;
}

interface CourseProjectsManagerProps {
    course: Course;
}

export function CourseProjectsManager({ course }: CourseProjectsManagerProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [editingLesson, setEditingLesson] = useState<any>(null);

    const [projectForm, setProjectForm] = useState({
        title: '',
        description: '',
        duration: '',
        isPublished: false,
    });

    const [lessonForm, setLessonForm] = useState({
        title: '',
        description: '',
        type: 'TEXT',
        duration: '',
        isPublished: false,
        projectId: '',
    });

    const handleCreateProject = async () => {
        if (!projectForm.title.trim()) {
            toast.error('Project title is required');
            return;
        }

        setIsLoading(true);
        try {
            const result = await createProject({
                title: projectForm.title,
                description: projectForm.description || undefined,
                duration: projectForm.duration ? parseInt(projectForm.duration) : undefined,
                isPublished: projectForm.isPublished,
                courseId: course.id,
            });

            if (result.success) {
                toast.success(result.message);
                setProjectForm({ title: '', description: '', duration: '', isPublished: false });
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Failed to create project');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProject = async () => {
        if (!editingProject || !editingProject.title.trim()) {
            toast.error('Project title is required');
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateProject(editingProject.id, {
                title: editingProject.title,
                description: editingProject.description || undefined,
                duration: editingProject.duration ? parseInt(editingProject.duration.toString()) : undefined,
                isPublished: editingProject.isPublished,
            });

            if (result.success) {
                toast.success(result.message);
                setEditingProject(null);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Failed to update project');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        setIsLoading(true);
        try {
            const result = await deleteProject(projectId);

            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Failed to delete project');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateLesson = async () => {
        if (!lessonForm.title.trim() || !lessonForm.projectId) {
            toast.error('Lesson title and project are required');
            return;
        }

        setIsLoading(true);
        try {
            const result = await createLesson({
                title: lessonForm.title,
                description: lessonForm.description || undefined,
                type: lessonForm.type as any,
                duration: lessonForm.duration ? parseInt(lessonForm.duration) : undefined,
                isPublished: lessonForm.isPublished,
                projectId: lessonForm.projectId,
            });

            if (result.success) {
                toast.success(result.message);
                setLessonForm({ title: '', description: '', type: 'TEXT', duration: '', isPublished: false, projectId: '' });
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Failed to create lesson');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateLesson = async () => {
        if (!editingLesson || !editingLesson.title.trim()) {
            toast.error('Lesson title is required');
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateLessonDetails(editingLesson.id, {
                title: editingLesson.title,
                description: editingLesson.description || undefined,
                type: editingLesson.type as any,
                duration: editingLesson.duration ? parseInt(editingLesson.duration.toString()) : undefined,
                isPublished: editingLesson.isPublished,
            });

            if (result.success) {
                toast.success(result.message);
                setEditingLesson(null);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Failed to update lesson');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        setIsLoading(true);
        try {
            const result = await deleteLesson(lessonId);

            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Failed to delete lesson');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Projects & Lessons</CardTitle>
                        <CardDescription>Manage course content structure</CardDescription>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                                <DialogDescription>
                                    Add a new project to organize lessons within this course.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="project-title">Title</Label>
                                    <Input
                                        id="project-title"
                                        value={projectForm.title}
                                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                                        placeholder="Project title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="project-description">Description</Label>
                                    <Textarea
                                        id="project-description"
                                        value={projectForm.description}
                                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                                        placeholder="Project description"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="project-duration">Duration (hours)</Label>
                                        <Input
                                            id="project-duration"
                                            type="number"
                                            value={projectForm.duration}
                                            onChange={(e) => setProjectForm({ ...projectForm, duration: e.target.value })}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="project-published"
                                            checked={projectForm.isPublished}
                                            onCheckedChange={(checked) => setProjectForm({ ...projectForm, isPublished: checked })}
                                        />
                                        <Label htmlFor="project-published">Published</Label>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button onClick={handleCreateProject} disabled={isLoading}>
                                        {isLoading ? 'Creating...' : 'Create Project'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {course.projects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-semibold">{project.title}</h4>
                                        <Badge variant={project.isPublished ? "default" : "secondary"}>
                                            {project.isPublished ? "Published" : "Draft"}
                                        </Badge>
                                    </div>
                                    {project.description && (
                                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {project._count.lessons} lessons
                                        {project.duration && ` • ${project.duration} hours`}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" onClick={() => {
                                                setLessonForm({ ...lessonForm, projectId: project.id });
                                            }}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Lesson
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Create New Lesson</DialogTitle>
                                                <DialogDescription>
                                                    Add a new lesson to {project.title}.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="lesson-title">Title</Label>
                                                    <Input
                                                        id="lesson-title"
                                                        value={lessonForm.title}
                                                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                                        placeholder="Lesson title"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lesson-description">Description</Label>
                                                    <Textarea
                                                        id="lesson-description"
                                                        value={lessonForm.description}
                                                        onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                                                        placeholder="Lesson description"
                                                        rows={2}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                                                        <Input
                                                            id="lesson-duration"
                                                            type="number"
                                                            value={lessonForm.duration}
                                                            onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                                            placeholder="0"
                                                            min="0"
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id="lesson-published"
                                                            checked={lessonForm.isPublished}
                                                            onCheckedChange={(checked) => setLessonForm({ ...lessonForm, isPublished: checked })}
                                                        />
                                                        <Label htmlFor="lesson-published">Published</Label>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                    <Button onClick={handleCreateLesson} disabled={isLoading}>
                                                        {isLoading ? 'Creating...' : 'Create Lesson'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Button size="sm" variant="outline" onClick={() => setEditingProject({
                                        ...project,
                                        duration: project.duration?.toString() || ''
                                    })}>
                                        <Edit className="h-4 w-4" />
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="outline">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete &quot;{project.title}&quot;? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>

                            {/* Lessons */}
                            {project.lessons.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {project.lessons.map((lesson, index) => (
                                        <div key={lesson.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium">
                                                        {index + 1}. {lesson.title}
                                                    </span>
                                                    <Badge variant={lesson.isPublished ? "default" : "secondary"} className="text-xs">
                                                        {lesson.isPublished ? "Published" : "Draft"}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {lesson.type}
                                                    </Badge>
                                                </div>
                                                {lesson.description && (
                                                    <p className="text-xs text-muted-foreground mt-1">{lesson.description}</p>
                                                )}
                                                {lesson.duration && (
                                                    <p className="text-xs text-muted-foreground">{lesson.duration} minutes</p>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <a href={`/lms/lessons/${lesson.id}`} target="_blank" rel="noopener noreferrer">
                                                        <BookOpen className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingLesson({
                                                    ...lesson,
                                                    duration: lesson.duration?.toString() || ''
                                                })}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="ghost">
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete &quot;{lesson.title}&quot;? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteLesson(lesson.id)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {course.projects.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Settings className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No projects yet. Create your first project to add lessons.</p>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Edit Project Dialog */}
            {editingProject && (
                <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                            <DialogDescription>
                                Update project information.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-project-title">Title</Label>
                                <Input
                                    id="edit-project-title"
                                    value={editingProject.title}
                                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                                    placeholder="Project title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-project-description">Description</Label>
                                <Textarea
                                    id="edit-project-description"
                                    value={editingProject.description || ''}
                                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                    placeholder="Project description"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-project-duration">Duration (hours)</Label>
                                    <Input
                                        id="edit-project-duration"
                                        type="number"
                                        value={editingProject.duration}
                                        onChange={(e) => setEditingProject({ ...editingProject, duration: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="edit-project-published"
                                        checked={editingProject.isPublished}
                                        onCheckedChange={(checked) => setEditingProject({ ...editingProject, isPublished: checked })}
                                    />
                                    <Label htmlFor="edit-project-published">Published</Label>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setEditingProject(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateProject} disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update Project'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Edit Lesson Dialog */}
            {editingLesson && (
                <Dialog open={!!editingLesson} onOpenChange={() => setEditingLesson(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Lesson</DialogTitle>
                            <DialogDescription>
                                Update lesson information.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-lesson-title">Title</Label>
                                <Input
                                    id="edit-lesson-title"
                                    value={editingLesson.title}
                                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                    placeholder="Lesson title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-lesson-description">Description</Label>
                                <Textarea
                                    id="edit-lesson-description"
                                    value={editingLesson.description || ''}
                                    onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                                    placeholder="Lesson description"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-lesson-duration">Duration (minutes)</Label>
                                    <Input
                                        id="edit-lesson-duration"
                                        type="number"
                                        value={editingLesson.duration}
                                        onChange={(e) => setEditingLesson({ ...editingLesson, duration: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="edit-lesson-published"
                                        checked={editingLesson.isPublished}
                                        onCheckedChange={(checked) => setEditingLesson({ ...editingLesson, isPublished: checked })}
                                    />
                                    <Label htmlFor="edit-lesson-published">Published</Label>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setEditingLesson(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateLesson} disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update Lesson'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    );
} 