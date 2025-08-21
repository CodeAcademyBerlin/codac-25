import { BookOpen, Users, GraduationCap, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db';

export default async function AdminDashboard() {
    const [courseStats, totalEnrollments] = await Promise.all([
        prisma.course.findMany({
            select: {
                id: true,
                title: true,
                isPublished: true,
                category: true,
                _count: {
                    select: {
                        projects: true,
                        enrollments: true
                    }
                }
            }
        }),
        prisma.courseEnrollment.count()
    ]);

    const totalCourses = courseStats.length;
    const publishedCourses = courseStats.filter(c => c.isPublished).length;
    const totalProjects = courseStats.reduce((sum, course) => sum + course._count.projects, 0);

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCourses}</div>
                        <p className="text-xs text-muted-foreground">
                            {publishedCourses} published
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProjects}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all courses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEnrollments}</div>
                        <p className="text-xs text-muted-foreground">
                            Active student enrollments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Enrollment</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {publishedCourses > 0 ? Math.round(totalEnrollments / publishedCourses) : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Students per course
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Link href="/lms/admin/courses/create">
                            <Button className="w-full justify-start" variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Course
                            </Button>
                        </Link>

                        <Link href="/lms/admin/courses">
                            <Button className="w-full justify-start" variant="outline">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Manage Courses
                            </Button>
                        </Link>

                        <Link href="/lms/admin/enrollments">
                            <Button className="w-full justify-start" variant="outline">
                                <Users className="mr-2 h-4 w-4" />
                                Manage Enrollments
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Course Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Overview</CardTitle>
                    <CardDescription>Overview of all courses in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {courseStats.map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-medium">{course.title}</h3>
                                        <Badge variant={course.isPublished ? "default" : "secondary"}>
                                            {course.isPublished ? "Published" : "Draft"}
                                        </Badge>
                                        <Badge variant="outline">
                                            {course.category.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {course._count.projects} projects • {course._count.enrollments} students
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <Link href={`/lms/admin/courses/${course.id}`}>
                                        <Button size="sm" variant="outline">
                                            Manage
                                        </Button>
                                    </Link>
                                    <Link href={`/lms/courses/${course.id}`}>
                                        <Button size="sm" variant="ghost">
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {courseStats.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No courses found. Create your first course to get started.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 