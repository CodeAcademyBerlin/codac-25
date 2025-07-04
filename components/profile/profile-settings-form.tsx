'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { updateProfile } from '@/actions/auth/update-profile';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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


type ProfileSettingsFormProps = {
    user: UserProfile;
};

// Settings schema
const settingsSchema = z.object({
    id: z.string().cuid(),
    name: z.string().min(1, 'Name is required').max(100),
    bio: z.string().max(500).optional(),
    avatar: z.string().optional(),
    linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
    currentJob: z.string().max(100).optional(),
    currentCompany: z.string().max(100).optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatar || undefined);

    const form = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
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

    const onSubmit = (data: SettingsFormData) => {
        startTransition(async () => {
            try {
                // Update avatar if changed
                if (avatarUrl !== user.avatar) {
                    data.avatar = avatarUrl;
                }

                // Convert empty strings to undefined for URL fields
                const processedData = {
                    ...data,
                    linkedinUrl: data.linkedinUrl || undefined,
                    githubUrl: data.githubUrl || undefined,
                    portfolioUrl: data.portfolioUrl || undefined,
                    currentJob: data.currentJob || undefined,
                    currentCompany: data.currentCompany || undefined,
                };

                const result = await updateProfile(processedData);

                if (result.success) {
                    toast.success('Settings updated successfully!');
                    router.refresh();
                } else {
                    toast.error(typeof result.error === 'string' ? result.error : 'Failed to update settings');
                }
            } catch (error) {
                toast.error('An unexpected error occurred');
                console.error('Settings update error:', error);
            }
        });
    };

    const handleAvatarUpdate = (newAvatar: string) => {
        setAvatarUrl(newAvatar);
        form.setValue('avatar', newAvatar);
    };

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Profile Picture */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                            <CardDescription>
                                Update your profile picture. Click on the avatar to upload a new image.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <AvatarUpload
                                    userId={user.id}
                                    currentAvatar={avatarUrl || undefined}
                                    userName={user.name || undefined}
                                    size="lg"
                                    onAvatarUpdate={handleAvatarUpdate}
                                    className="shadow-lg"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Update your basic profile information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name *</FormLabel>
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
                                                className="min-h-[120px]"
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
                        </CardContent>
                    </Card>

                    {/* Professional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Information</CardTitle>
                            <CardDescription>
                                Share your professional background and current role.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                        </CardContent>
                    </Card>

                    {/* Social Links */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Social Links</CardTitle>
                            <CardDescription>
                                Connect your social profiles and portfolio.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending} size="lg">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Settings
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 