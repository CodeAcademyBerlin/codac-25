import { notFound } from 'next/navigation';

import { AttendancePieChart } from '@/components/attendance/attendance-pie-chart';
import { AttendanceStatistics } from '@/components/attendance/attendance-statistics';
import { InteractiveAttendanceManager } from '@/components/attendance/interactive-attendance-manager';
import { InteractiveDatePicker } from '@/components/attendance/interactive-date-picker';
import { Grid, Section } from '@/components/layout';
import { getCohortAttendanceForDate } from '@/data/attendance/get-cohort-attendance-for-date';
import { getCohortForAttendance } from '@/data/attendance/get-cohort-for-attendance';

import { SectionErrorBoundary } from '@/components/error';

type AttendanceServerProps = {
  cohortSlug: string;
  dateParam?: string;
  totalStudents: number;
  onProgressUpdate?: () => void;
};

export async function AttendanceServer({
  cohortSlug,
  dateParam,
  totalStudents,
  onProgressUpdate,
}: AttendanceServerProps) {
  // Get valid attendance date from search params
  const attendanceDate = dateParam ? new Date(dateParam) : new Date();

  // Fetch attendance data on the server
  const attendanceResult = await getCohortAttendanceForDate(
    cohortSlug,
    attendanceDate
  );

  // Handle attendance data errors
  if (!attendanceResult.success) {
    return (
      <div className='text-center py-8'>
        <p className='text-destructive'>
          {typeof attendanceResult.error === 'string'
            ? attendanceResult.error
            : 'Failed to load attendance data'}
        </p>
      </div>
    );
  }

  const { students, isEditable } = attendanceResult.data;

  // Calculate statistics for the current date
  const presentCount = students.filter(
    s => s.attendance?.status === 'PRESENT'
  ).length;
  const absentSickCount = students.filter(
    s => s.attendance?.status === 'ABSENT_SICK'
  ).length;
  const absentExcusedCount = students.filter(
    s => s.attendance?.status === 'ABSENT_EXCUSED'
  ).length;
  const absentUnexcusedCount = students.filter(
    s => s.attendance?.status === 'ABSENT_UNEXCUSED'
  ).length;
  const absentCount =
    absentSickCount + absentExcusedCount + absentUnexcusedCount;
  const unrecordedCount = students.filter(s => !s.attendance).length;

  // Get cohort info for the attendance manager
  const cohortResult = await getCohortForAttendance(cohortSlug);
  if (!cohortResult.success) {
    notFound();
  }

  const { cohort } = cohortResult.data;

  return (
    <>
      {/* Date Selection and Statistics */}
      <InteractiveDatePicker
        attendanceDate={attendanceDate}
        isEditable={isEditable}
        cohortSlug={cohortSlug}
        presentCount={presentCount}
        absentCount={absentCount}
        unrecordedCount={unrecordedCount}
        totalStudents={totalStudents}
        hasUnsavedChanges={false}
      />

      {/* Student Attendance Table */}
      <InteractiveAttendanceManager
        students={students}
        cohort={cohort}
        attendanceDate={attendanceDate}
        isEditable={isEditable}
        onProgressUpdate={onProgressUpdate}
      />

      {/* Attendance Visualization */}
      <Section>
        <SectionErrorBoundary sectionName='attendance visualization'>
          <Grid cols={2} gap='lg'>
            <AttendanceStatistics
              data={{
                present: presentCount,
                absentSick: absentSickCount,
                absentExcused: absentExcusedCount,
                absentUnexcused: absentUnexcusedCount,
                unrecorded: unrecordedCount,
              }}
              totalStudents={totalStudents}
              date={attendanceDate}
            />

            <AttendancePieChart
              data={{
                present: presentCount,
                absentSick: absentSickCount,
                absentExcused: absentExcusedCount,
                absentUnexcused: absentUnexcusedCount,
                unrecorded: unrecordedCount,
              }}
              totalStudents={totalStudents}
              date={attendanceDate}
            />
          </Grid>
        </SectionErrorBoundary>
      </Section>
    </>
  );
}
