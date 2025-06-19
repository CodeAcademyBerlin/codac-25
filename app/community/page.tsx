import { Users, GraduationCap, Calendar, TrendingUp } from 'lucide-react';

import { CohortCard } from '@/components/community/cohort-card';
import { StudentCard } from '@/components/community/student-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCohorts } from '@/data/cohort/get-cohorts';

export default async function CommunityPage() {
    const result = await getCohorts();

    if (!result.success || !result.data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Community</h1>
                    <p className="text-muted-foreground">
                        {'error' in result ? (typeof result.error === 'string' ? result.error : 'Invalid data format') : 'Failed to load community data'}
                    </p>
                </div>
            </div>
        );
    }

    const { cohorts, totalStudents } = result.data;

    // Get all students across all cohorts for featured students section
    const allStudents = cohorts.flatMap(cohort =>
        cohort.students.map(student => ({
            ...student,
            cohortName: cohort.name,
        }))
    );

    // Get featured students (most active ones)
    const featuredStudents = allStudents
        .sort((a, b) => {
            const aActivity = a._count.documents + a._count.posts + a._count.comments + a._count.achievements;
            const bActivity = b._count.documents + b._count.posts + b._count.comments + b._count.achievements;
            return bActivity - aActivity;
        })
        .slice(0, 8);

    const activeStudents = allStudents.filter(student => student.status === 'ACTIVE').length;
    const graduatedStudents = allStudents.filter(student => student.status === 'GRADUATED').length;
    const activeCohorts = cohorts.filter(cohort => cohort.startDate <= new Date()).length;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Community</h1>
                <p className="text-xl text-muted-foreground">
                    Connect with your peers, explore cohorts, and be part of our growing community
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all cohorts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently learning
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Graduates</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{graduatedStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            Successfully completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Cohorts</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCohorts}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently running
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Cohorts Section */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Cohorts</h2>
                        <p className="text-muted-foreground">
                            Explore our different cohorts and their specializations
                        </p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                        {cohorts.length} cohort{cohorts.length !== 1 ? 's' : ''}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cohorts.map((cohort) => (
                        <CohortCard key={cohort.id} cohort={cohort} />
                    ))}
                </div>
            </section>

            {/* Featured Students Section */}
            {featuredStudents.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Featured Students</h2>
                            <p className="text-muted-foreground">
                                Most active community members
                            </p>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            Top {featuredStudents.length}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {featuredStudents.map((student) => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                cohortName={student.cohortName}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {cohorts.length === 0 && (
                <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No cohorts found</h3>
                    <p className="text-muted-foreground">
                        There are no active cohorts at the moment. Check back later!
                    </p>
                </div>
            )}
        </div>
    );
}

