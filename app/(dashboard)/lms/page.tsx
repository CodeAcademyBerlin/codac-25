import { PageContainer } from "@/components/layout";
import { getEnrolledCourses, getCourses } from '@/data/lms/courses';
import { requireServerAuth } from '@/lib/auth/auth-server';

import { LMSDashboard } from './components/lms-dashboard';

export default async function LMSPage() {
    const user = await requireServerAuth();

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