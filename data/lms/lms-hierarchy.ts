import { cache } from 'react';

import { prisma } from "@/lib/db";

export interface LMSTreeNode {
    id: string;
    title: string;
    type: 'COURSE' | 'PROJECT' | 'LESSON';
    parentId?: string;
    children?: LMSTreeNode[];
    isExpanded?: boolean;
    // Additional metadata
    description?: string;
    isPublished?: boolean;
    duration?: number;
    order?: number;
    category?: string;
    lessonType?: string;
}

// Transform database LMS data into tree structure
function buildLMSTree(courses: any[]): LMSTreeNode[] {
    const rootNodes: LMSTreeNode[] = [];

    courses.forEach(course => {
        const courseNode: LMSTreeNode = {
            id: course.id,
            title: course.title,
            type: 'COURSE',
            description: course.description,
            isPublished: course.isPublished,
            duration: course.duration,
            order: course.order,
            category: course.category,
            children: [],
            isExpanded: false
        };

        // Add projects as children
        if (course.projects) {
            course.projects.forEach((project: any) => {
                const projectNode: LMSTreeNode = {
                    id: project.id,
                    title: project.title,
                    type: 'PROJECT',
                    parentId: course.id,
                    description: project.description,
                    isPublished: project.isPublished,
                    duration: project.duration,
                    order: project.order,
                    children: [],
                    isExpanded: false
                };

                // Add lessons as children
                if (project.lessons) {
                    project.lessons.forEach((lesson: any) => {
                        const lessonNode: LMSTreeNode = {
                            id: lesson.id,
                            title: lesson.title,
                            type: 'LESSON',
                            parentId: project.id,
                            description: lesson.description,
                            isPublished: lesson.isPublished,
                            duration: lesson.duration,
                            order: lesson.order,
                            lessonType: lesson.type,
                            isExpanded: false
                        };
                        projectNode.children!.push(lessonNode);
                    });
                }

                // Sort lessons by order
                projectNode.children = projectNode.children!.sort((a, b) => (a.order || 0) - (b.order || 0));
                courseNode.children!.push(projectNode);
            });
        }

        // Sort projects by order
        courseNode.children = courseNode.children!.sort((a, b) => (a.order || 0) - (b.order || 0));
        rootNodes.push(courseNode);
    });

    // Sort courses by order
    return rootNodes.sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Cache the LMS hierarchy
export const getLMSHierarchy = cache(async (): Promise<LMSTreeNode[]> => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                projects: {
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });

        return buildLMSTree(courses);
    } catch (error) {
        console.error('Failed to get LMS hierarchy:', error);
        return [];
    }
});

// Get flattened list of all LMS items for quick lookup
export const getFlatLMSItems = cache(async (): Promise<{
    courses: any[],
    projects: any[],
    lessons: any[]
}> => {
    try {
        const [courses, projects, lessons] = await Promise.all([
            prisma.course.findMany({
                orderBy: { order: 'asc' }
            }),
            prisma.project.findMany({
                include: { course: true },
                orderBy: { order: 'asc' }
            }),
            prisma.lesson.findMany({
                include: {
                    project: {
                        include: { course: true }
                    }
                },
                orderBy: { order: 'asc' }
            })
        ]);

        return { courses, projects, lessons };
    } catch (error) {
        console.error('Failed to get flat LMS items:', error);
        return { courses: [], projects: [], lessons: [] };
    }
});

// Helper functions for LMS operations
export const isLMSCourse = (item: any): boolean => {
    return item && typeof item.id === 'string' && item.title && !item.courseId && !item.projectId;
};

export const isLMSProject = (item: any): boolean => {
    return item && typeof item.id === 'string' && item.title && item.courseId && !item.projectId;
};

export const isLMSLesson = (item: any): boolean => {
    return item && typeof item.id === 'string' && item.title && item.projectId;
}; 