'use client';

import { Camera, Upload, X, Loader2 } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';

import { updateUserAvatar } from '@/actions/user/update-user-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
    userId: string;
    currentAvatar?: string;
    userName?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    onAvatarUpdate?: (newAvatar: string) => void;
}

const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-20 w-20'
};

export function AvatarUpload({
    userId,
    currentAvatar,
    userName,
    className,
    size = 'md',
    onAvatarUpdate
}: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        // Convert to base64 for preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setPreviewImage(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!previewImage) return;

        setIsUploading(true);
        try {
            const result = await updateUserAvatar(userId, previewImage);

            if (result.success) {
                toast.success('Avatar updated successfully');
                onAvatarUpdate?.(previewImage);
                setIsDialogOpen(false);
                setPreviewImage(null);
            } else {
                const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to update avatar';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            toast.error('Failed to update avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        setPreviewImage(null);
        setIsDialogOpen(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const initials = userName ? userName.charAt(0).toUpperCase() : 'U';
    const displayAvatar = previewImage || currentAvatar;

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <div className={cn('relative group cursor-pointer', className)}>
                    <Avatar className={cn(sizeClasses[size], 'transition-opacity group-hover:opacity-80')}>
                        <AvatarImage src={currentAvatar} alt={userName || 'User'} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                        'absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity',
                        sizeClasses[size]
                    )}>
                        <Camera className="h-4 w-4 text-white" />
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Avatar</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Preview Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={displayAvatar} alt={userName || 'User'} />
                            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                        </Avatar>

                        {previewImage && (
                            <div className="text-sm text-muted-foreground text-center">
                                Preview of your new avatar
                            </div>
                        )}
                    </div>

                    {/* Upload Section */}
                    <div className="space-y-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {!previewImage ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Choose Image
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Choose Different
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCancel}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="text-xs text-muted-foreground text-center">
                            Supported formats: JPG, PNG, GIF, WEBP. Max size: 5MB.
                            <br />
                            Images will be automatically resized to 384x384 pixels.
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {previewImage && (
                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={handleCancel}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="flex-1"
                                onClick={handleUpload}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Update Avatar'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 