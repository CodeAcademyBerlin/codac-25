import { notFound } from 'next/navigation';

import { CourseDetail } from '@/components/lms/course-detail';
import { getCourse, canEditCourse } from '@/data/lms/courses';
import { getCurrentUser } from '@/lib/auth/auth-utils';


export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        notFound();
    }

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