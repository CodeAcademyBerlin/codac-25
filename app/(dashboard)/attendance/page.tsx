import { ClipboardCheck, Users, School, TrendingUp } from 'lucide-react';

import { AttendanceCohortCard } from '@/components/attendance/attendance-cohort-card';
import { PageErrorBoundary, SectionErrorBoundary } from '@/components/error';
import { Grid, PageContainer, PageHeader, Section } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCohortsForAttendance } from '@/data/attendance/get-cohorts-for-attendance';

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {

    // Fetch cohorts for attendance
    const result = await getCohortsForAttendance();

    if (!result.success) {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to load attendance data';

        return (
            <PageErrorBoundary pageName="Attendance">
                <PageContainer>
                    <PageHeader
                        title="Student Attendance Tracker"
                        description="Access denied or failed to load attendance data"
                    />
                    <div className="text-center mt-8">
                        <p className="text-muted-foreground">
                            {errorMessage}
                        </p>
                    </div>
                </PageContainer>
            </PageErrorBoundary>
        );
    }

    if (!result.data) {
        return (
            <PageErrorBoundary pageName="Attendance">
                <PageContainer>
                    <PageHeader
                        title="Student Attendance Tracker"
                        description="No data available"
                    />
                    <div className="text-center mt-8">
                        <p className="text-muted-foreground">
                            No attendance data could be loaded.
                        </p>
                    </div>
                </PageContainer>
            </PageErrorBoundary>
        );
    }

    const { cohorts, totalActiveStudents } = result.data;

    // Calculate additional statistics
    const activeCohorts = cohorts.filter(cohort =>
        cohort.endDate ? new Date(cohort.endDate) > new Date() : true
    );
    const endedCohorts = cohorts.filter(cohort =>
        cohort.endDate ? new Date(cohort.endDate) <= new Date() : false
    );

    return (
        <PageErrorBoundary pageName="Attendance">
            <PageContainer>
                <PageHeader
                    title="Student Attendance Tracker"
                    description="Track and manage daily attendance for all active cohorts"
                />

                {/* Statistics Overview */}
                <Section>
                    <SectionErrorBoundary sectionName="attendance statistics">
                        <Grid cols="4" className="mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Cohorts</CardTitle>
                                    <School className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{cohorts.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {activeCohorts.length} active, {endedCohorts.length} ended
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalActiveStudents}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Across all active cohorts
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Cohorts</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{activeCohorts.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Currently running programs
                                    </p>
                                </CardContent>
                            </Card>
                        </Grid>
                    </SectionErrorBoundary>
                </Section>

                {/* Active Cohorts */}
                {activeCohorts.length > 0 && (
                    <Section>
                        <SectionErrorBoundary sectionName="active cohorts">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">Active Cohorts</h2>
                                <p className="text-muted-foreground">
                                    Click on a cohort to manage daily attendance
                                </p>
                            </div>

                            <Grid cols="3">
                                {activeCohorts.map((cohort) => (
                                    <AttendanceCohortCard
                                        key={cohort.id}
                                        cohort={cohort}
                                    />
                                ))}
                            </Grid>
                        </SectionErrorBoundary>
                    </Section>
                )}

                {/* Ended Cohorts */}
                {endedCohorts.length > 0 && (
                    <Section>
                        <SectionErrorBoundary sectionName="ended cohorts">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">Ended Cohorts</h2>
                                <p className="text-muted-foreground">
                                    View historical attendance data
                                </p>
                            </div>

                            <Grid cols="3">
                                {endedCohorts.map((cohort) => (
                                    <AttendanceCohortCard
                                        key={cohort.id}
                                        cohort={cohort}
                                    />
                                ))}
                            </Grid>
                        </SectionErrorBoundary>
                    </Section>
                )}

                {/* Empty State */}
                {cohorts.length === 0 && (
                    <Section>
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-12">
                                <ClipboardCheck className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Cohorts Found</h3>
                                <p className="text-muted-foreground text-center mb-6">
                                    There are no cohorts available for attendance tracking yet.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Contact an administrator to create cohorts.
                                </p>
                            </CardContent>
                        </Card>
                    </Section>
                )}
            </PageContainer>
        </PageErrorBoundary>
    );
}
