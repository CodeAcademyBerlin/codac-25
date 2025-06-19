'use client';

import { useState } from 'react';
import { UserProfile } from '@/data/user/get-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit3, Calendar, MapPin, Briefcase } from 'lucide-react';
import { ProfileEditModal } from './profile-edit-modal';
import { format } from 'date-fns';

type ProfileHeaderProps = {
    user: UserProfile;
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getRoleColor(role: string): string {
    switch (role) {
        case 'STUDENT':
            return 'bg-blue-500';
        case 'ALUMNI':
            return 'bg-green-500';
        case 'MENTOR':
            return 'bg-purple-500';
        case 'ADMIN':
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
}

function getStatusColor(status: string): string {
    switch (status) {
        case 'ACTIVE':
            return 'bg-green-500';
        case 'GRADUATED':
            return 'bg-blue-500';
        case 'INACTIVE':
            return 'bg-gray-500';
        default:
            return 'bg-gray-500';
    }
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <Card>
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <Avatar className="h-24 w-24 md:h-32 md:w-32">
                            <AvatarImage
                                src={user.avatar || user.image || undefined}
                                alt={user.name || 'User'}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl md:text-3xl">
                                {user.name ? getInitials(user.name) : 'U'}
                            </AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">
                                        {user.name || 'Anonymous User'}
                                    </h1>
                                    <p className="text-muted-foreground mb-3">
                                        {user.email}
                                    </p>

                                    {/* Role and Status Badges */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <Badge
                                            variant="outline"
                                            className={`${getRoleColor(user.role)} text-white border-none`}
                                        >
                                            {user.role}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={`${getStatusColor(user.status)} text-white border-none`}
                                        >
                                            {user.status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Edit Button */}
                                <Button onClick={() => setIsEditModalOpen(true)}>
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Button>
                            </div>

                            {/* Additional Info Row */}
                            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                                {(user.currentJob || user.currentCompany) && (
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        <span>
                                            {user.currentJob && user.currentCompany
                                                ? `${user.currentJob} at ${user.currentCompany}`
                                                : user.currentJob || user.currentCompany}
                                        </span>
                                    </div>
                                )}

                                {user.cohort && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>Cohort: {user.cohort.name}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <div className="mt-6 pt-6 border-t">
                            <p className="text-muted-foreground leading-relaxed">
                                {user.bio}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <ProfileEditModal
                user={user}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </>
    );
} 