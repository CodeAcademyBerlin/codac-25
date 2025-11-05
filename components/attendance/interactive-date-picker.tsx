'use client';

import { addDays, format, isWeekend, subDays } from 'date-fns';
import { CalendarDays, CalendarIcon, Clock, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Grid, Section } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { isDateDisabled } from '@/utils/attendance/date';

import { SectionErrorBoundary } from '@/components/error';

interface InteractiveDatePickerProps {
  attendanceDate: Date;
  isEditable: boolean;
  cohortSlug: string;
  presentCount: number;
  absentCount: number;
  unrecordedCount: number;
  totalStudents: number;
  hasUnsavedChanges: boolean;
  onUnsavedChangesWarning?: () => boolean;
}

export function InteractiveDatePicker({
  attendanceDate,
  isEditable,
  cohortSlug,
  presentCount,
  absentCount,
  unrecordedCount,
  totalStudents,
  hasUnsavedChanges,
  onUnsavedChangesWarning,
}: InteractiveDatePickerProps) {
  const router = useRouter();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateChange = useCallback(
    (newDate: Date) => {
      // Check for unsaved changes before navigating
      if (hasUnsavedChanges) {
        const confirmChange = onUnsavedChangesWarning
          ? onUnsavedChangesWarning()
          : window.confirm(
              'You have unsaved changes. Are you sure you want to navigate to a different date? All unsaved changes will be lost.'
            );

        if (!confirmChange) {
          return;
        }
      }

      // Update URL with new date
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      router.push(`/attendance/${cohortSlug}?date=${formattedDate}`);
    },
    [router, cohortSlug, hasUnsavedChanges, onUnsavedChangesWarning]
  );

  // Handle calendar date selection
  const handleCalendarDateSelect = useCallback(
    (selectedDate: Date | undefined) => {
      if (!selectedDate || isDateDisabled(selectedDate)) {
        return;
      }

      // Get valid attendance date (handles weekends and validation)
      const validDate = new Date(format(selectedDate, 'yyyy-MM-dd'));
      handleDateChange(validDate);
      setIsCalendarOpen(false);
    },
    [handleDateChange]
  );

  // Generate date navigation helpers
  const getPreviousWeekday = () => {
    let prev = subDays(attendanceDate, 1);
    while (isWeekend(prev)) {
      prev = subDays(prev, 1);
    }
    return prev;
  };

  const getNextWeekday = () => {
    const today = new Date();
    let next = addDays(attendanceDate, 1);
    while (isWeekend(next)) {
      next = addDays(next, 1);
    }
    // Don't allow navigation to future dates
    return next <= today ? next : null;
  };

  const previousWeekday = getPreviousWeekday();
  const nextWeekday = getNextWeekday();

  return (
    <Section>
      <SectionErrorBoundary sectionName='date and statistics'>
        <div className='flex flex-col lg:flex-row gap-6 mb-8'>
          {/* Date Navigation */}
          <Card className='lg:w-1/3'>
            <CardHeader>
              <CardTitle className='flex items-center justify-center text-lg'>
                <CalendarDays className='h-5 w-5 mr-2' />
                Attendance Date:
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center'>
                <div className='text-2xl font-bold'>
                  {format(attendanceDate, 'EEEE')}
                </div>
                <div className='text-lg text-muted-foreground'>
                  {format(attendanceDate, 'MMMM d, yyyy')}
                </div>

                {!isEditable && (
                  <Badge variant='secondary' className='mt-2'>
                    <Clock className='h-3 w-3 mr-1' />
                    Read-only (30+ days old)
                  </Badge>
                )}
              </div>

              <div className='flex items-center justify-center space-x-2 p-5'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleDateChange(previousWeekday)}
                >
                  ← Previous Day
                </Button>

                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      className='px-3'
                      title='Pick a date'
                    >
                      <CalendarIcon className='h-4 w-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='center'>
                    <Calendar
                      mode='single'
                      selected={attendanceDate}
                      onSelect={handleCalendarDateSelect}
                      disabled={isDateDisabled}
                      initialFocus
                      fromYear={2020}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>

                {nextWeekday && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDateChange(nextWeekday)}
                  >
                    Next Day →
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Statistics */}
          <div className='lg:w-2/3'>
            <Grid cols={3} className='gap-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Present</CardTitle>
                  <Users className='h-4 w-4 text-green-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-green-600'>
                    {presentCount}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {totalStudents > 0
                      ? Math.round((presentCount / totalStudents) * 100)
                      : 0}
                    % of students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Absent</CardTitle>
                  <Users className='h-4 w-4 text-red-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-red-600'>
                    {absentCount}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {totalStudents > 0
                      ? Math.round((absentCount / totalStudents) * 100)
                      : 0}
                    % of students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Unrecorded
                  </CardTitle>
                  <Users className='h-4 w-4 text-amber-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-amber-600'>
                    {unrecordedCount}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Need to record attendance
                  </p>
                </CardContent>
              </Card>
            </Grid>
          </div>
        </div>
      </SectionErrorBoundary>
    </Section>
  );
}
