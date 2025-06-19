import { Users, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import type { CohortWithStudents } from '@/data/cohort/get-cohorts';

type CohortCardProps = {
    cohort: CohortWithStudents;
};

export function CohortCard({ cohort }: CohortCardProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
        }).format(date);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const isActive = cohort.startDate <= new Date();
    const statusColor = isActive ? 'bg-green-500' : 'bg-blue-500';
    const statusText = isActive ? 'Active' : 'Upcoming';

    return (
        <Card className="transition-all duration-200 hover:shadow-lg border-border/50 hover:border-border">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <Link href={`/community/cohorts/${cohort.slug}`} className="flex items-center gap-3 flex-1 group">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={cohort.avatar || undefined} alt={cohort.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(cohort.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {cohort.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={`${statusColor} text-white border-none`}>
                                    {statusText}
                                </Badge>
                            </div>
                        </div>
                    </Link>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {cohort.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {cohort.description}
                    </p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{cohort._count.students} student{cohort._count.students !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(cohort.startDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Student avatars preview */}
                {cohort.students.length > 0 && (
                    <div className="flex items-center gap-2 mt-4">
                        <div className="flex -space-x-2">
                            {cohort.students.slice(0, 5).map((student) => {
                                const getRolePath = () => {
                                    if (student.status === 'GRADUATED') return 'alumni';
                                    if (student.role === 'MENTOR') return 'mentors';
                                    return 'students';
                                };
                                const userProfileUrl = `/community/${getRolePath()}/${student.id}`;

                                return (
                                    <Link
                                        key={student.id}
                                        href={userProfileUrl}
                                        className="transition-transform hover:scale-110 hover:z-10 relative"
                                    >
                                        <Avatar className="h-6 w-6 border-2 border-background">
                                            <AvatarImage src={student.avatar || undefined} alt={student.name || 'Student'} />
                                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                {student.name ? getInitials(student.name) : '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                );
                            })}
                            {cohort.students.length > 5 && (
                                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        +{cohort.students.length - 5}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 