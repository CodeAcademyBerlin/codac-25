'use client';

import { format } from 'date-fns';
import {
    Github,
    Linkedin,
    Globe,
    Calendar,
    GraduationCap,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile } from '@/data/user/get-user';

type ProfileContentProps = {
    user: UserProfile;
};

export function ProfileContent({ user }: ProfileContentProps) {
    const socialLinks = [
        {
            label: 'GitHub',
            url: user.githubUrl,
            icon: Github,
            color: 'hover:text-gray-900'
        },
        {
            label: 'LinkedIn',
            url: user.linkedinUrl,
            icon: Linkedin,
            color: 'hover:text-blue-600'
        },
        {
            label: 'Portfolio',
            url: user.portfolioUrl,
            icon: Globe,
            color: 'hover:text-green-600'
        }
    ].filter(link => link.url);

    return (
        <div className="space-y-6">
            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Email
                            </label>
                            <p className="mt-1">{user.email}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Role
                            </label>
                            <p className="mt-1">
                                <Badge variant="outline" className="capitalize">
                                    {user.role.toLowerCase()}
                                </Badge>
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Status
                            </label>
                            <p className="mt-1">
                                <Badge variant="outline" className="capitalize">
                                    {user.status.toLowerCase()}
                                </Badge>
                            </p>
                        </div>

                        {user.graduationDate && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Graduation Date
                                </label>
                                <p className="mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(user.graduationDate), 'MMMM dd, yyyy')}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Professional Information */}
            {(user.currentJob || user.currentCompany) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.currentJob && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Current Position
                                    </label>
                                    <p className="mt-1">{user.currentJob}</p>
                                </div>
                            )}

                            {user.currentCompany && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Company
                                    </label>
                                    <p className="mt-1">{user.currentCompany}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Cohort Information */}
            {user.cohort && (
                <Card>
                    <CardHeader>
                        <CardTitle>Cohort Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            {user.cohort.avatar && (
                                <img
                                    src={user.cohort.avatar}
                                    alt={user.cohort.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                            )}
                            <div>
                                <h4 className="font-semibold">{user.cohort.name}</h4>
                                {user.cohort.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {user.cohort.description}
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground mt-1">
                                    Started: {format(new Date(user.cohort.startDate), 'MMMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Social Links</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {socialLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Button
                                        key={link.label}
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className={`${link.color} transition-colors`}
                                    >
                                        <Link
                                            href={link.url!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Icon className="mr-2 h-4 w-4" />
                                            {link.label}
                                            <ExternalLink className="ml-2 h-3 w-3" />
                                        </Link>
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 