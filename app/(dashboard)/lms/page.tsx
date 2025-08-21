import { redirect } from 'next/navigation';

import { PageContainer } from "@/components/layout";
import { getEnrolledCourses, getCourses } from '@/data/lms/courses';
import { getCurrentUser } from '@/lib/auth/auth-utils';

import { LMSDashboard } from './components/lms-dashboard';

export default async function LMSPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/signin?callbackUrl=/lms');
    }

    const [enrolledCourses, allCourses] = await Promise.all([
        getEnrolledCourses(),
        getCourses(),
    ]);

    return (
        <PageContainer>
            <LMSDashboard
                user={user}
                enrolledCourses={enrolledCourses}
                allCourses={allCourses}
            />
        </PageContainer>
    );
} 