import { redirect } from 'next/navigation';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { getEnrolledCourses, getCourses } from '@/data/lms/courses';
import { getLMSHierarchy } from '@/data/lms/lms-hierarchy';
import { getCurrentUser } from '@/lib/auth/auth-utils';

import { LMSSidebar } from './components/lms-sidebar';

import { MobileTopPanel } from '@/app/(dashboard)/lms/components/mobile-top-panel';

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
        <div className="h-[calc(100vh-4rem)] w-full bg-background">
            {/* Mobile Layout - Vertical Stack */}
            <div className="lg:hidden h-full flex flex-col">
                {/* Collapsible Top Panel */}
                <MobileTopPanel
                    enrolledCourses={enrolledCourses}
                    allCourses={allCourses}
                    userRole={user.role}
                    lmsHierarchy={lmsHierarchy}
                />
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Desktop Layout - Horizontal Resizable */}
            <div className="hidden lg:block h-full">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                    {/* Conversations Sidebar */}
                    <ResizablePanel defaultSize={25} minSize={15} maxSize={45}>
                        <LMSSidebar
                            enrolledCourses={enrolledCourses}
                            allCourses={allCourses}
                            userRole={user.role}
                            lmsHierarchy={lmsHierarchy}
                        />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={70}>
                        <main className="flex-1 overflow-y-auto">
                            {children}
                        </main>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
} 