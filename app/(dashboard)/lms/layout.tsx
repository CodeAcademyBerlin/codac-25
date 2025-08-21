import { redirect } from 'next/navigation';

import { DndWrapper } from '@/app/(dashboard)/docs/components/dnd-wrapper';
import { HideHeader } from '@/components/hide-header';
import { ResizableSidebar } from '@/components/ui/resizable-sidebar';
import { getEnrolledCourses, getCourses } from '@/data/lms/courses';
import { getLMSHierarchy } from '@/data/lms/lms-hierarchy';
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

    // Get enrolled courses, all available courses, and LMS hierarchy
    const [enrolledCourses, allCourses, lmsHierarchy] = await Promise.all([
        getEnrolledCourses(),
        getCourses(),
        getLMSHierarchy(),
    ]);

    return (
        <DndWrapper>
            <HideHeader />
            <div className="flex h-full flex-col">
                <LMSNavbar user={user} />
                <div className="flex flex-1 overflow-hidden">
                    <ResizableSidebar
                        defaultWidth={320}
                        minWidth={240}
                        maxWidth={600}
                        storageKey="lms-sidebar-width"
                        className="border-r bg-muted/30"
                    >
                        <LMSSidebar
                            enrolledCourses={enrolledCourses}
                            allCourses={allCourses}
                            userRole={user.role}
                            lmsHierarchy={lmsHierarchy}
                        />
                    </ResizableSidebar>
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </DndWrapper>
    );
} 