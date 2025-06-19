import { Github, Linkedin, ExternalLink, Briefcase, Calendar, Trophy, FileText, MessageSquare, BookOpen } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { CohortWithStudents } from '@/data/cohort/get-cohorts';

type StudentCardProps = {
    student: CohortWithStudents['students'][0];
    cohortName?: string;
};

export function StudentCard({ student, cohortName }: StudentCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusColor = (status: string) => {
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
    };

    const getRoleColor = (role: string) => {
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
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
        }).format(date);
    };

    // Determine the correct role path for navigation
    const getRolePath = () => {
        if (student.status === 'GRADUATED') return 'alumni';
        if (student.role === 'MENTOR') return 'mentors';
        return 'students';
    };

    const userProfileUrl = `/community/${getRolePath()}/${student.id}`;

    return (
        <Card className="transition-all duration-200 hover:shadow-lg border-border/50 hover:border-border">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <Link href={userProfileUrl} className="flex items-center gap-3 flex-1 group">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={student.avatar || undefined} alt={student.name || 'Student'} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {student.name ? getInitials(student.name) : '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {student.name || 'Anonymous Student'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={`${getRoleColor(student.role)} text-white border-none text-xs`}>
                                    {student.role}
                                </Badge>
                                <Badge variant="outline" className={`${getStatusColor(student.status)} text-white border-none text-xs`}>
                                    {student.status}
                                </Badge>
                            </div>
                        </div>
                    </Link>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {student.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {student.bio}
                    </p>
                )}

                {/* Current job/company */}
                {(student.currentJob || student.currentCompany) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Briefcase className="h-4 w-4" />
                        <span>
                            {student.currentJob && student.currentCompany
                                ? `${student.currentJob} at ${student.currentCompany}`
                                : student.currentJob || student.currentCompany}
                        </span>
                    </div>
                )}

                {/* Cohort info */}
                {cohortName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4" />
                        <span>{cohortName}</span>
                    </div>
                )}

                {/* Graduation date */}
                {student.graduationDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Trophy className="h-4 w-4" />
                        <span>Graduated {formatDate(student.graduationDate)}</span>
                    </div>
                )}

                {/* Activity stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {student._count.documents} doc{student._count.documents !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {student._count.enrollments} course{student._count.enrollments !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {student._count.posts + student._count.comments} post{(student._count.posts + student._count.comments) !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {student._count.achievements || 0} achievement{(student._count.achievements || 0) !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Social links */}
                <div className="flex items-center gap-2">
                    {student.githubUrl && (
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                            <Link href={student.githubUrl} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                        </Button>
                    )}
                    {student.linkedinUrl && (
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                            <Link href={student.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-4 w-4" />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                        </Button>
                    )}
                    {student.portfolioUrl && (
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                            <Link href={student.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">Portfolio</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 