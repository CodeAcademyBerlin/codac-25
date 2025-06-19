'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { updateProfile } from '@/actions/auth/update-profile';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserProfile } from '@/data/user/get-user';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation/auth';


type ProfileEditModalProps = {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
};

export function ProfileEditModal({ user, isOpen, onClose }: ProfileEditModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [avatarUrl, setAvatarUrl] = useState<string>((user as any).avatar || '');

    const form = useForm<UpdateProfileInput>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            id: user.id,
            name: user.name || '',
            bio: user.bio || '',
            avatar: user.avatar || '',
            linkedinUrl: user.linkedinUrl || '',
            githubUrl: user.githubUrl || '',
            portfolioUrl: user.portfolioUrl || '',
            currentJob: user.currentJob || '',
            currentCompany: user.currentCompany || '',
        },
    });

    const onSubmit = (data: UpdateProfileInput) => {
        startTransition(async () => {
            try {
                // Update avatar if changed
                if (avatarUrl !== user.avatar) {
                    data.avatar = avatarUrl;
                }

                const result = await updateProfile(data);

                if (result.success) {
                    toast.success('Profile updated successfully!');
                    onClose();
                    router.refresh();
                } else {
                    if (Array.isArray(result.error)) {
                        toast.error(result.error.map(e => e.message).join(', '));
                    } else {
                        toast.error(result.error || 'Failed to update profile');
                    }
                }
            } catch (error) {
                toast.error('An unexpected error occurred');
                console.error('Profile update error:', error);
            }
        });
    };

    const handleAvatarUpdate = (newAvatar: string) => {
        setAvatarUrl(newAvatar);
        form.setValue('avatar', newAvatar);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information and settings.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <AvatarUpload
                                userId={user.id}
                                currentAvatar={avatarUrl}
                                userName={user.name || ''}
                                size="lg"
                                onAvatarUpdate={handleAvatarUpdate}
                                className="shadow-lg"
                            />
                            <p className="text-sm text-muted-foreground text-center">
                                Click on your avatar to change your profile picture
                            </p>
                        </div>

                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Basic Information</h3>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your full name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us about yourself..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Brief description about yourself (max 500 characters)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Professional Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="currentJob"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Position</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Software Developer" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="currentCompany"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Tech Corp" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Social Links</h3>

                            <FormField
                                control={form.control}
                                name="linkedinUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>LinkedIn URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://linkedin.com/in/yourprofile"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="githubUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GitHub URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://github.com/yourusername"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="portfolioUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Portfolio URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://yourportfolio.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 