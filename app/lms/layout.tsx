import { redirect } from 'next/navigation';

import { getEnrolledCourses, getCourses } from '@/data/lms/courses';
import { getCurrentUser } from '@/lib/auth/auth-utils';

import { LMSNavbar } from './components/lms-navbar';
import { LMSSidebar } from './components/lms-sidebar';

export default async function LMSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Require authentication for LMS access
    const user = await getCurrentUser();
    if (!user) {
        redirect('/auth/signin?callbackUrl=/lms');
    }

    // Get enrolled courses and all available courses
    const [enrolledCourses, allCourses] = await Promise.all([
        getEnrolledCourses(),
        getCourses(),
    ]);

    return (
        <div className="flex h-full flex-col">
            <LMSNavbar user={user} />
            <div className="flex flex-1 overflow-hidden">
                <LMSSidebar
                    enrolledCourses={enrolledCourses}
                    allCourses={allCourses}
                    userRole={user.role}
                />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
} 