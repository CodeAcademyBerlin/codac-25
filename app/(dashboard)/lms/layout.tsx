import { MobileTopPanel } from '@/app/(dashboard)/lms/components/mobile-top-panel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { getEnrolledCourses, getCourses } from '@/data/lms/courses';
import { getLMSHierarchy } from '@/data/lms/lms-hierarchy';
import { requireServerAuth } from '@/lib/auth/auth-server';

import { LMSSidebar } from './components/lms-sidebar';


export default async function LMSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Require authentication for LMS access
    const user = await requireServerAuth();

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
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
                        <LMSSidebar
                            enrolledCourses={enrolledCourses}
                            allCourses={allCourses}
                            userRole={user.role}
                            lmsHierarchy={lmsHierarchy}
                        />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={80}>
                        <main className="flex-1">
                            {children}
                        </main>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
} 