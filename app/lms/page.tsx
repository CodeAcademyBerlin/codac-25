import { redirect } from 'next/navigation';

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
        <div className="p-6">
            <LMSDashboard
                user={user}
                enrolledCourses={enrolledCourses}
                allCourses={allCourses}
            />
        </div>
    );
} 