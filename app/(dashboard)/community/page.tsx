import { Calendar, GraduationCap, TrendingUp, Users } from 'lucide-react';

import { CohortCard } from '@/components/community/cohort-card';
import { Grid, PageContainer, PageHeader, Section, SectionHeader, StatsGrid } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCohorts } from '@/data/cohort/get-cohorts';

export default async function CommunityPage() {


    const result = await getCohorts();

    if (!result.success || !result.data) {
        return (
            <PageContainer>
                <div className="text-center">
                    <PageHeader
                        title="Community"
                        description={'error' in result ? (typeof result.error === 'string' ? result.error : 'Invalid data format') : 'Failed to load community data'}
                    />
                </div>
            </PageContainer>
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



    const activeStudents = allStudents.filter(student => student.status === 'ACTIVE').length;
    const graduatedStudents = allStudents.filter(student => student.status === 'GRADUATED').length;
    const activeCohorts = cohorts.filter(cohort => cohort.startDate <= new Date()).length;

    return (
        <PageContainer>
            <PageHeader
                title="Community"
                description="Celebrate the achievements of our graduates and stay connected with the CODAC community"
                size="lg"
            />

            <Section>
                <StatsGrid>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
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
                            <CardTitle className="text-sm font-medium">Graduates</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{graduatedStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Successfully completed the program
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Legacy Members</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Continuing their journey
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Cohorts</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeCohorts}</div>
                            <p className="text-xs text-muted-foreground">
                                Successfully concluded
                            </p>
                        </CardContent>
                    </Card>
                </StatsGrid>
            </Section>

            <Section>
                <SectionHeader
                    title="Cohorts"
                    description="Explore our completed cohorts and their remarkable journeys"
                    badge={
                        <Badge variant="secondary" className="text-sm">
                            {cohorts.length} cohort{cohorts.length !== 1 ? 's' : ''}
                        </Badge>
                    }
                />

                <Grid cols="3">
                    {cohorts.map((cohort) => (
                        <CohortCard key={cohort.id} cohort={cohort} />
                    ))}
                </Grid>
            </Section>


            {cohorts.length === 0 && (
                <Section>
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No cohorts found</h3>
                        <p className="text-muted-foreground">
                            The academy has completed its mission. Thank you to all our graduates!
                        </p>
                    </div>
                </Section>
            )}
        </PageContainer>
    );
}

