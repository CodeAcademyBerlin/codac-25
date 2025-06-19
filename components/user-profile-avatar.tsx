'use client';

import React, { useState } from 'react';

import { AvatarUpload } from '@/components/ui/avatar-upload';

interface UserProfileAvatarProps {
    user: {
        id: string;
        name?: string;
        email: string;
        avatar?: string;
    };
}

export function UserProfileAvatar({ user }: UserProfileAvatarProps) {
    const [currentAvatar, setCurrentAvatar] = useState(user.avatar);

    const handleAvatarUpdate = (newAvatar: string) => {
        setCurrentAvatar(newAvatar);
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <AvatarUpload
                userId={user.id}
                currentAvatar={currentAvatar}
                userName={user.name}
                size="lg"
                onAvatarUpdate={handleAvatarUpdate}
                className="shadow-lg"
            />

            <div className="text-center">
                <h3 className="text-lg font-semibold">{user.name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Click avatar to update
                </p>
            </div>
        </div>
    );
} 