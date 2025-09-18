import { notFound } from 'next/navigation';

import { CourseDetail } from '@/components/lms/course-detail';
import { getCourse, canEditCourse } from '@/data/lms/courses';
import { requireServerAuth } from '@/lib/auth/auth-server';


export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await requireServerAuth();

    const [course, canEdit] = await Promise.all([
        getCourse(id),
        canEditCourse(id),
    ]);

    if (!course) {
        notFound();
    }

    return (
        <div className="p-6">
            <CourseDetail
                course={course}
                user={user}
                canEdit={canEdit}
            />
        </div>
    );
} 