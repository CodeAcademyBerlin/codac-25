import { Users, BookOpen, TrendingUp } from 'lucide-react';
import { Suspense } from 'react';

import { GlobalEnrollmentManager } from '@/components/lms/global-enrollment-manager';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db';




async function EnrollmentManagementContent() {
    const [enrollmentStats, courseEnrollments, recentEnrollments] = await Promise.all([
        prisma.courseEnrollment.count(),
        prisma.course.findMany({
            include: {
                _count: {
                    select: { enrollments: true }
                },
                enrollments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            }
                        }
                    },
                    orderBy: { enrolledAt: 'desc' },
                    take: 5
                }
            },
            orderBy: {
                enrollments: {
                    _count: 'desc'
                }
            }
        }),
        prisma.courseEnrollment.findMany({
            take: 10,
            orderBy: { enrolledAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                    }
                }
            }
        })
    ]);

    const totalCourses = courseEnrollments.length;
    const coursesWithEnrollments = courseEnrollments.filter(c => c._count.enrollments > 0).length;
    const averageEnrollment = totalCourses > 0 ? Math.round(enrollmentStats / totalCourses) : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Enrollment Management</h1>
                <p className="text-muted-foreground">
                    Manage student enrollments across all courses
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enrollmentStats}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all courses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{coursesWithEnrollments}</div>
                        <p className="text-xs text-muted-foreground">
                            Out of {totalCourses} total courses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Enrollment</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageEnrollment}</div>
                        <p className="text-xs text-muted-foreground">
                            Students per course
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Course Enrollment Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Course Enrollment Overview</CardTitle>
                        <CardDescription>Enrollment statistics by course</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {courseEnrollments.slice(0, 10).map((course) => (
                                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium">{course.title}</div>
                                        <div className="text-sm text-muted-foreground">
                                            <Badge variant="outline" className="mr-2">
                                                {course.category.replace('_', ' ')}
                                            </Badge>
                                            {course._count.enrollments} students
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{course._count.enrollments}</div>
                                    </div>
                                </div>
                            ))}

                            {courseEnrollments.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No courses with enrollments found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Enrollments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Enrollments</CardTitle>
                        <CardDescription>Latest student enrollments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentEnrollments.map((enrollment) => (
                                <div key={`${enrollment.user.id}-${enrollment.course.id}`} className="flex items-center space-x-3">
                                    <Avatar>
                                        <AvatarImage src={enrollment.user.avatar || undefined} />
                                        <AvatarFallback>
                                            {enrollment.user.name?.charAt(0) || enrollment.user.email?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            {enrollment.user.name || 'No Name'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            enrolled in {enrollment.course.title}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}

                            {recentEnrollments.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No recent enrollments found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Global Enrollment Management */}
            <GlobalEnrollmentManager courses={courseEnrollments} />
        </div>
    );
}

export default function EnrollmentManagementPage() {
    return (
        <Suspense fallback={<div>Loading enrollment management...</div>}>
            <EnrollmentManagementContent />
        </Suspense>
    );
} 