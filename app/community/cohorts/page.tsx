import { Users, Calendar, Search, Filter } from 'lucide-react';

import { CohortCard } from '@/components/community/cohort-card';
import { getCohorts } from '@/data/cohort/get-cohorts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default async function CohortsPage() {
    const result = await getCohorts();

    if (!result.success || !result.data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Cohorts</h1>
                    <p className="text-muted-foreground">
                        {'error' in result ? (typeof result.error === 'string' ? result.error : 'Invalid data format') : 'Failed to load cohorts'}
                    </p>
                </div>
            </div>
        );
    }

    const { cohorts, totalStudents } = result.data;

    const activeCohorts = cohorts.filter(cohort => cohort.startDate <= new Date());
    const upcomingCohorts = cohorts.filter(cohort => cohort.startDate > new Date());

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Cohorts</h1>
                <p className="text-xl text-muted-foreground">
                    Explore our different cohorts and their specializations
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cohorts</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{cohorts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            All cohorts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Cohorts</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCohorts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently running
                        </p>
                    </CardContent>
                </Card>

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
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search cohorts..."
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Active Cohorts Section */}
            {activeCohorts.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Active Cohorts</h2>
                            <p className="text-muted-foreground">
                                Currently running cohorts
                            </p>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {activeCohorts.length} active
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeCohorts.map((cohort) => (
                            <CohortCard key={cohort.id} cohort={cohort} />
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming Cohorts Section */}
            {upcomingCohorts.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Upcoming Cohorts</h2>
                            <p className="text-muted-foreground">
                                Starting soon
                            </p>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            {upcomingCohorts.length} upcoming
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingCohorts.map((cohort) => (
                            <CohortCard key={cohort.id} cohort={cohort} />
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
                        There are no cohorts at the moment. Check back later!
                    </p>
                </div>
            )}
        </div>
    );
} 