'use client';

import { UserProfile } from '@/data/user/get-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Heart,
    MessageSquare,
    Trophy,
    BookOpen,
    Calendar,
    Users
} from 'lucide-react';

type ProfileStatsProps = {
    user: UserProfile;
};

export function ProfileStats({ user }: ProfileStatsProps) {
    const stats = [
        {
            label: 'Documents',
            value: user._count.documents,
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            label: 'Favorites',
            value: user._count.favorites,
            icon: Heart,
            color: 'text-red-600',
            bgColor: 'bg-red-100'
        },
        {
            label: 'Comments',
            value: user._count.comments,
            icon: MessageSquare,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            label: 'Posts',
            value: user._count.posts,
            icon: MessageSquare,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            label: 'Achievements',
            value: user._count.achievements,
            icon: Trophy,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        },
        {
            label: 'Enrollments',
            value: user._count.enrollments,
            icon: BookOpen,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Activity Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Activity Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                                >
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`h-4 w-4 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Member Since</span>
                        </div>
                        <span className="text-sm font-medium">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Role</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                            {user.role.toLowerCase()}
                        </Badge>
                    </div>

                    {user.cohort && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Cohort</span>
                            </div>
                            <span className="text-sm font-medium">
                                {user.cohort.name}
                            </span>
                        </div>
                    )}

                    {user.status === 'GRADUATED' && user.graduationDate && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Graduated</span>
                            </div>
                            <span className="text-sm font-medium">
                                {new Date(user.graduationDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <button className="w-full text-left p-2 text-sm hover:bg-muted rounded-md transition-colors">
                        View My Documents
                    </button>
                    <button className="w-full text-left p-2 text-sm hover:bg-muted rounded-md transition-colors">
                        My Favorites
                    </button>
                    <button className="w-full text-left p-2 text-sm hover:bg-muted rounded-md transition-colors">
                        Account Settings
                    </button>
                    {user.cohort && (
                        <button className="w-full text-left p-2 text-sm hover:bg-muted rounded-md transition-colors">
                            View Cohort
                        </button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 