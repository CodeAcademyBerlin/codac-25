import { Users, GraduationCap, Search, Filter, TrendingUp, Award, Star, Trophy, Briefcase, Calendar, MessageSquare } from 'lucide-react';
import { notFound } from 'next/navigation';


import { StudentCard } from '@/components/community/student-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getUsers } from '@/data/user/get-users';
import { UserWithCounts } from '@/lib/server-action-utils';

type Params = {
    userRole: string;
};

const roleConfig = {
    students: {
        title: 'Students',
        description: 'Connect with fellow students and see what they\'re working on',
        role: 'STUDENT' as const,
        statusFilter: null,
        emptyMessage: 'There are no students to display at the moment.',
        sections: {
            active: { title: 'Active Students', description: 'Currently enrolled and learning' },
            inactive: { title: 'Other Students', description: 'Previous students and inactive accounts' }
        }
    },
    mentors: {
        title: 'Mentors',
        description: 'Connect with experienced mentors who can guide your learning journey',
        role: 'MENTOR' as const,
        statusFilter: null,
        emptyMessage: 'There are no mentors to display at the moment.',
        sections: {
            active: { title: 'Active Mentors', description: 'Available mentors ready to help you grow' },
            inactive: { title: 'Other Mentors', description: 'Previous mentors and inactive profiles' }
        }
    },
    alumni: {
        title: 'Alumni',
        description: 'Celebrate the success of our graduates and stay connected with the community',
        role: null,
        statusFilter: 'GRADUATED' as const,
        emptyMessage: 'There are no alumni to display at the moment.',
        sections: {
            active: { title: 'Recent Graduates', description: 'Our newest alumni making their mark in the industry' },
            inactive: { title: 'All Alumni', description: 'Our complete alumni network' }
        }
    }
};

export async function generateStaticParams() {
    return [
        { role: 'students' },
        { role: 'mentors' },
        { role: 'alumni' }
    ];
}

export default async function CommunityRolePage({ params }: { params: Promise<Params> }) {
    const { userRole } = await params;

    if (!roleConfig[userRole as keyof typeof roleConfig]) {
        notFound();
    }

    const config = roleConfig[userRole as keyof typeof roleConfig];

    const queryParams: {
        limit: number;
        offset: number;
        role?: 'STUDENT' | 'MENTOR' | 'ALUMNI' | 'ADMIN';
        status?: 'GRADUATED' | 'ACTIVE' | 'INACTIVE';
    } = {
        limit: 50,
        offset: 0,
    };

    if (config.role) {
        queryParams.role = config.role;
    }

    if (config.statusFilter) {
        queryParams.status = config.statusFilter;
    }

    const result = await getUsers(queryParams);

    if (!result.success || !result.data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">{config.title}</h1>
                    <p className="text-muted-foreground">
                        Failed to load {userRole}
                    </p>
                </div>
            </div>
        );
    }

    const { users, total } = result.data;

    // Filter users based on role-specific logic
    let activeUsers: UserWithCounts[] = [];
    let inactiveUsers: UserWithCounts[] = [];

    let employedCount: number = 0;
    let recentCount: number = 0;

    if (userRole === 'alumni') {
        const currentYear = new Date().getFullYear();
        activeUsers = users.filter(user =>
            user.graduationDate && new Date(user.graduationDate).getFullYear() >= currentYear - 2
        );
        inactiveUsers = users.filter(user =>
            !user.graduationDate || new Date(user.graduationDate).getFullYear() < currentYear - 2
        );
        employedCount = users.filter(user => user.currentJob || user.currentCompany).length;
        recentCount = activeUsers.length;
    } else {
        activeUsers = users.filter(user => user.status === 'ACTIVE');
        inactiveUsers = users.filter(user => user.status === 'INACTIVE');
    }

    const renderStats = () => {
        if (userRole === 'alumni') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{total}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Graduates</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{recentCount}</div>
                            <p className="text-xs text-muted-foreground">Last 2 years</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Employed</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{employedCount}</div>
                            <p className="text-xs text-muted-foreground">With current jobs</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {total > 0 ? Math.round((employedCount / total) * 100) : 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">Employment rate</p>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        const icon = userRole === 'mentors' ? Award : TrendingUp;
        const IconComponent = icon;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total {config.title}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active {config.title}</CardTitle>
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeUsers.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {userRole === 'mentors' ? 'Currently available' : 'Currently learning'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Showing</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">Of {total} total</p>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderCallToAction = () => {
        if (userRole === 'mentors') {
            return (
                <div className="mt-12 text-center">
                    <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                        <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Want to become a mentor?</h3>
                        <p className="text-muted-foreground mb-4">
                            Share your knowledge and help others on their learning journey
                        </p>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            Apply to be a Mentor
                        </Button>
                    </Card>
                </div>
            );
        }

        if (userRole === 'alumni') {
            return (
                <div className="mt-12">
                    <Card className="p-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                        <div className="text-center">
                            <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Alumni Success Stories</h3>
                            <p className="text-muted-foreground mb-6">
                                Our graduates are making incredible contributions across the tech industry.
                                From startups to Fortune 500 companies, they&apos;re building the future.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button variant="outline">Share Your Story</Button>
                                <Button className="bg-green-600 hover:bg-green-700">
                                    View Success Stories
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{config.title}</h1>
                <p className="text-xl text-muted-foreground">
                    {config.description}
                </p>
            </div>

            {/* Stats Overview */}
            {renderStats()}

            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={`Search ${userRole}...`}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </div>

            {/* Active/Recent Section */}
            {activeUsers.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{config.sections.active.title}</h2>
                            <p className="text-muted-foreground">
                                {config.sections.active.description}
                            </p>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {activeUsers.length} {userRole === 'alumni' ? 'recent' : userRole === 'mentors' ? 'available' : 'active'}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {activeUsers.map((user) => (
                            <StudentCard key={user.id} student={user} />
                        ))}
                    </div>
                </section>
            )}

            {/* Inactive/Other Section */}
            {inactiveUsers.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{config.sections.inactive.title}</h2>
                            <p className="text-muted-foreground">
                                {config.sections.inactive.description}
                            </p>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            {inactiveUsers.length} {userRole === 'alumni' ? 'alumni' : userRole}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {inactiveUsers.map((user) => (
                            <StudentCard key={user.id} student={user} />
                        ))}
                    </div>
                </section>
            )}

            {/* Load More Button */}
            {users.length < total && (
                <div className="text-center mb-12">
                    <Button variant="outline" size="lg">
                        Load More {config.title}
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {users.length === 0 && (
                <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No {userRole} found</h3>
                    <p className="text-muted-foreground">
                        {config.emptyMessage}
                    </p>
                </div>
            )}

            {/* Call to Action */}
            {renderCallToAction()}
        </div>
    );
} 