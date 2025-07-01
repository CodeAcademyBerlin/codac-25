'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { createCourse, updateCourse, CreateCourseData } from '@/actions/lms/create-course';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    thumbnail?: string | null;
    duration?: number | null;
    isPublished: boolean;
}

interface CourseFormProps {
    course?: Course;
    mode: 'create' | 'edit';
}

const courseCategories = [
    { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
    { value: 'DATA_SCIENCE', label: 'Data Science' },
    { value: 'UX_UI_DESIGN', label: 'UX/UI Design' },
    { value: 'DIGITAL_MARKETING', label: 'Digital Marketing' },
    { value: 'CAREER_DEVELOPMENT', label: 'Career Development' },
    { value: 'SOFT_SKILLS', label: 'Soft Skills' },
];

export function CourseForm({ course, mode }: CourseFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: course?.title || '',
        description: course?.description || '',
        category: course?.category || '',
        thumbnail: course?.thumbnail || '',
        duration: course?.duration?.toString() || '',
        isPublished: course?.isPublished ?? false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data: CreateCourseData = {
                title: formData.title,
                description: formData.description,
                category: formData.category as CreateCourseData['category'],
                thumbnail: formData.thumbnail || undefined,
                duration: formData.duration ? parseInt(formData.duration) : undefined,
                isPublished: formData.isPublished,
            };

            let result;
            if (mode === 'create') {
                result = await createCourse(data);
            } else {
                result = await updateCourse(course!.id, data);
            }

            if (result.success) {
                toast.success(result.message);
                if (mode === 'create') {
                    if (result.data) {
                        router.push(`/lms/admin/courses/${result.data.id}`);
                    }
                } else {
                    router.refresh();
                }
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>
                    {mode === 'create' ? 'Create New Course' : 'Edit Course'}
                </CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Fill in the details to create a new course'
                        : 'Update the course information'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Enter course title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Enter course description"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => handleInputChange('category', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {courseCategories.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                        {category.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (hours)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={formData.duration}
                                onChange={(e) => handleInputChange('duration', e.target.value)}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="thumbnail">Thumbnail URL</Label>
                            <Input
                                id="thumbnail"
                                value={formData.thumbnail}
                                onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isPublished"
                            checked={formData.isPublished}
                            onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                        />
                        <Label htmlFor="isPublished">Published</Label>
                        <span className="text-sm text-muted-foreground">
                            {formData.isPublished
                                ? 'Course is visible to students'
                                : 'Course is hidden from students'
                            }
                        </span>
                    </div>

                    <div className="flex space-x-3">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading
                                ? (mode === 'create' ? 'Creating...' : 'Updating...')
                                : (mode === 'create' ? 'Create Course' : 'Update Course')
                            }
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
} 