import {
    ArrowLeft,
    Users,
    Calendar,
    Briefcase,
    GraduationCap,
    Github,
    Linkedin,
    ExternalLink,
    Mail,
    Trophy,
    FileText,
    MessageSquare,
    BookOpen,
    Heart,
    Star
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/data/user/get-user';

type Params = {
    userRole: string;
    userId: string;
};

const roleConfig = {
    students: { title: 'Student', plural: 'Students' },
    mentors: { title: 'Mentor', plural: 'Mentors' },
    alumni: { title: 'Alumni', plural: 'Alumni' }
};

function getInitials(name: string) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getStatusColor(status: string) {
    switch (status) {
        case 'ACTIVE':
            return 'bg-green-500';
        case 'GRADUATED':
            return 'bg-purple-500';
        case 'INACTIVE':
            return 'bg-gray-500';
        default:
            return 'bg-blue-500';
    }
}

function getRoleColor(role: string) {
    switch (role) {
        case 'STUDENT':
            return 'bg-blue-500';
        case 'ALUMNI':
            return 'bg-purple-500';
        case 'MENTOR':
            return 'bg-green-500';
        case 'INSTRUCTOR':
            return 'bg-orange-500';
        default:
            return 'bg-gray-500';
    }
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

function formatJoinDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
    }).format(date);
}

export default async function UserDetailsPage({ params }: { params: Promise<Params> }) {
    const { userRole, userId } = await params;

    if (!roleConfig[userRole as keyof typeof roleConfig]) {
        notFound();
    }

    const config = roleConfig[userRole as keyof typeof roleConfig];

    const result = await getUser(userId);

    if (!result.success || !result.data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">User Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        The user you're looking for doesn't exist.
                    </p>
                    <Button asChild>
                        <Link href={`/community/${userRole}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to {config.plural}
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const user = result.data;

    // Validate that the user matches the role
    const isValidRole = () => {
        if (userRole === 'students' && user.role === 'STUDENT') return true;
        if (userRole === 'mentors' && user.role === 'MENTOR') return true;
        if (userRole === 'alumni' && user.status === 'GRADUATED') return true;
        return false;
    };

    if (!isValidRole()) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href={`/community/${userRole}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to {config.plural}
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Profile Card */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={user.avatar || undefined} alt={user.name || 'User'} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                                        {user.name ? getInitials(user.name) : '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold mb-2">
                                        {user.name || 'Anonymous User'}
                                    </h1>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge variant="outline" className={`${getRoleColor(user.role)} text-white border-none`}>
                                            {user.role}
                                        </Badge>
                                        <Badge variant="outline" className={`${getStatusColor(user.status)} text-white border-none`}>
                                            {user.status}
                                        </Badge>
                                    </div>

                                    {/* Current Position */}
                                    {(user.currentJob || user.currentCompany) && (
                                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                            <Briefcase className="h-4 w-4" />
                                            <span>
                                                {user.currentJob && user.currentCompany
                                                    ? `${user.currentJob} at ${user.currentCompany}`
                                                    : user.currentJob || user.currentCompany}
                                            </span>
                                        </div>
                                    )}

                                    {/* Cohort Info */}
                                    {user.cohort && (
                                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                            <Users className="h-4 w-4" />
                                            <Link
                                                href={`/community/cohorts/${user.cohort.slug}`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {user.cohort.name}
                                            </Link>
                                        </div>
                                    )}

                                    {/* Graduation Date */}
                                    {user.graduationDate && (
                                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                            <GraduationCap className="h-4 w-4" />
                                            <span>Graduated {formatDate(user.graduationDate)}</span>
                                        </div>
                                    )}

                                    {/* Join Date */}
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Joined {formatJoinDate(user.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        {user.bio && (
                            <CardContent>
                                <h3 className="font-semibold mb-2">About</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {user.bio}
                                </p>
                            </CardContent>
                        )}
                    </Card>

                    {/* Activity Stats */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Activity & Contributions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="text-2xl font-bold">{user._count.documents}</div>
                                    <div className="text-sm text-muted-foreground">Documents</div>
                                </div>

                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <BookOpen className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="text-2xl font-bold">{user._count.enrollments}</div>
                                    <div className="text-sm text-muted-foreground">Courses</div>
                                </div>

                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <MessageSquare className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div className="text-2xl font-bold">{user._count.posts + user._count.comments}</div>
                                    <div className="text-sm text-muted-foreground">Posts</div>
                                </div>

                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <Trophy className="h-5 w-5 text-yellow-500" />
                                    </div>
                                    <div className="text-2xl font-bold">{user._count.achievements}</div>
                                    <div className="text-sm text-muted-foreground">Achievements</div>
                                </div>

                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <Heart className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div className="text-2xl font-bold">{user._count.favorites}</div>
                                    <div className="text-sm text-muted-foreground">Favorites</div>
                                </div>

                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <Star className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {user._count.documents + user._count.posts + user._count.comments + user._count.achievements}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Activity</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact & Social Links */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact & Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Email */}
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a
                                    href={`mailto:${user.email}`}
                                    className="text-sm hover:text-primary transition-colors"
                                >
                                    {user.email}
                                </a>
                            </div>

                            {/* Social Links */}
                            {(user.githubUrl || user.linkedinUrl || user.portfolioUrl) && (
                                <div className="pt-4 border-t">
                                    <div className="flex flex-wrap gap-2">
                                        {user.githubUrl && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer">
                                                    <Github className="h-4 w-4 mr-2" />
                                                    GitHub
                                                </a>
                                            </Button>
                                        )}
                                        {user.linkedinUrl && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                                    <Linkedin className="h-4 w-4 mr-2" />
                                                    LinkedIn
                                                </a>
                                            </Button>
                                        )}
                                        {user.portfolioUrl && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Portfolio
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cohort Information */}
                    {user.cohort && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Cohort</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={user.cohort.avatar || undefined} alt={user.cohort.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                            {getInitials(user.cohort.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Link
                                            href={`/community/cohorts/${user.cohort.slug}`}
                                            className="font-semibold hover:text-primary transition-colors"
                                        >
                                            {user.cohort.name}
                                        </Link>
                                        <div className="text-sm text-muted-foreground">
                                            Started {formatJoinDate(user.cohort.startDate)}
                                        </div>
                                    </div>
                                </div>
                                {user.cohort.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {user.cohort.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send Message
                            </Button>
                            {userRole === 'mentors' && (
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Book Session
                                </Button>
                            )}
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <Heart className="h-4 w-4 mr-2" />
                                Follow
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 