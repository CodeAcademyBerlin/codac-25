'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { LMSTreeNode } from '@/data/lms/lms-hierarchy';

import { LMSSidebar } from './lms-sidebar';

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    projects: Array<{
        id: string;
        title: string;
        lessons: Array<{
            id: string;
            title: string;
            type: string;
            progress: Array<{
                status: string;
            }>;
        }>;
    }>;
    enrollments?: Array<{ userId: string; }>;
    _count: {
        enrollments: number;
        projects: number;
    };
}

interface MobileTopPanelProps {
    enrolledCourses: Course[];
    allCourses: Course[];
    userRole: string;
    lmsHierarchy: LMSTreeNode[];
}

export function MobileTopPanel({ enrolledCourses, allCourses, userRole, lmsHierarchy }: MobileTopPanelProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b bg-background">
            {/* Collapse Toggle Button */}
            <div className="flex items-center justify-center p-2 border-b bg-muted/30">
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <span className="text-sm font-medium">Course Navigation</span>
                        {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </CollapsibleTrigger>
            </div>

            {/* Collapsible Content */}
            <CollapsibleContent className="overflow-hidden">
                <div className="h-64 overflow-hidden">
                    <LMSSidebar
                        enrolledCourses={enrolledCourses}
                        allCourses={allCourses}
                        userRole={userRole}
                        lmsHierarchy={lmsHierarchy}
                    />
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

