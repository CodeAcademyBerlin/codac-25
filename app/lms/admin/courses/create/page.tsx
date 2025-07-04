import { CourseForm } from '@/components/lms/course-form';

export default function CreateCoursePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Create New Course</h1>
                <p className="text-muted-foreground">
                    Create a new course for the learning management system
                </p>
            </div>

            <CourseForm mode="create" />
        </div>
    );
} 