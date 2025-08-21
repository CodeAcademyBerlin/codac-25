import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ProfileSettingsForm } from '@/components/profile/profile-settings-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/data/user/get-user';
import { auth } from '@/lib/auth/auth';

export const metadata = {
    title: 'Profile Settings | Codac',
    description: 'Manage your account settings and preferences',
};

export default async function ProfileSettingsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    const result = await getUser(session.user.id);

    if (!result.success || !result.data) {
        redirect('/auth/signin');
    }

    const user = result.data;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/profile">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Profile
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Profile Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your account settings and preferences
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Settings Form */}
                    <div className="lg:col-span-2">
                        <ProfileSettingsForm user={user} />
                    </div>

                    {/* Account Information */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                                <CardDescription>
                                    Your account details and status
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                    <p className="mt-1 capitalize">{user.role.toLowerCase()}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Status
                                    </label>
                                    <p className="mt-1 capitalize">{user.status.toLowerCase()}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Member Since
                                    </label>
                                    <p className="mt-1">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
} 