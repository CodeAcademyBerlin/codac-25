import { redirect } from 'next/navigation';

import { PageContainer } from "@/components/layout";
import { ProfileContent } from '@/components/profile/profile-content';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileStats } from '@/components/profile/profile-stats';
import { getUser } from '@/data/user/get-user';
import { auth } from '@/lib/auth/auth';

export const metadata = {
    title: 'Profile | Codac',
    description: 'Manage your profile information',
};

export default async function ProfilePage() {
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
        <PageContainer size="lg">
            <div className="space-y-8">
                {/* Profile Header */}
                <ProfileHeader user={user} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Profile Content */}
                    <div className="lg:col-span-2">
                        <ProfileContent user={user} />
                    </div>

                    {/* Profile Stats Sidebar */}
                    <div className="lg:col-span-1">
                        <ProfileStats user={user} />
                    </div>
                </div>
            </div>
        </PageContainer>
    );
} 