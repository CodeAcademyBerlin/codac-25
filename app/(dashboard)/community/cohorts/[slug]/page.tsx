import { Users, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { StudentCard } from '@/components/community/student-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCohorts } from '@/data/cohort/get-cohorts';
import { requireServerAuth } from '@/lib/auth/auth-server';

type CohortPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function CohortPage({ params }: CohortPageProps) {
    const { slug } = await params;

    // Get current user
    const user = await requireServerAuth();
    const currentUserId = user.id;

    const result = await getCohorts();

    if (!result.success || !result.data) {
        notFound();
    }

    const { cohorts } = result.data;
    const cohort = cohorts.find(c => c.slug === slug);

    if (!cohort) {
        notFound();
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    const isActive = cohort.startDate <= new Date();
    const statusColor = isActive ? 'bg-green-500' : 'bg-blue-500';
    const statusText = isActive ? 'Active' : 'Upcoming';

    // Get students by status
    const activeStudents = cohort.students.filter(s => s.status === 'ACTIVE');
    const graduatedStudents = cohort.students.filter(s => s.status === 'GRADUATED');
    const allStudents = cohort.students;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back button */}
            <div className="mb-6">
                <Button variant="ghost" className="gap-2" asChild>
                    <Link href="/community">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Community
                    </Link>
                </Button>
            </div>

            {/* Cohort Header */}
            <div className="mb-8">
                <div className="flex items-start gap-6 mb-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={cohort.avatar || undefined} alt={cohort.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                            {getInitials(cohort.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold">{cohort.name}</h1>
                            <Badge variant="outline" className={`${statusColor} text-white border-none`}>
                                {statusText}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Started {formatDate(cohort.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{cohort.students.length} student{cohort.students.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>

                        {cohort.description && (
                            <p className="text-lg text-muted-foreground max-w-3xl">
                                {cohort.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allStudents.length}</div>
                        <p className="text-xs text-muted-foreground">
                            In this cohort
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeStudents.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently learning
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Graduates</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{graduatedStudents.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Successfully completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Students Section */}
            {allStudents.length > 0 ? (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Students</h2>
                            <p className="text-muted-foreground">
                                Meet the talented individuals in this cohort
                            </p>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {allStudents.length} student{allStudents.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {allStudents.map((student) => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                cohortName={cohort.name}
                                currentUserId={currentUserId}
                            />
                        ))}
                    </div>
                </section>
            ) : (
                <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No students yet</h3>
                    <p className="text-muted-foreground">
                        This cohort doesn&apos;t have any students enrolled yet.
                    </p>
                </div>
            )}
        </div>
    );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CohortPageProps) {
    const { slug } = await params;
    const result = await getCohorts();

    if (!result.success || !result.data) {
        return {
            title: 'Cohort Not Found | CODAC',
            description: 'The requested cohort could not be found.',
        };
    }

    const { cohorts } = result.data;
    const cohort = cohorts.find(c => c.slug === slug);

    if (!cohort) {
        return {
            title: 'Cohort Not Found | CODAC',
            description: 'The requested cohort could not be found.',
        };
    }

    return {
        title: `${cohort.name} | CODAC Community`,
        description: cohort.description || `Learn more about the ${cohort.name} cohort and its students.`,
    };
}

// Generate static params for better performance
export async function generateStaticParams() {
    const result = await getCohorts();

    if (!result.success || !result.data) {
        return [];
    }

    const { cohorts } = result.data;

    return cohorts.map((cohort) => ({
        slug: cohort.slug,
    }));
} 