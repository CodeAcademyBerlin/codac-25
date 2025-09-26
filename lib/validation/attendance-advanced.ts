import { AttendanceStatus, UserRole, UserStatus } from '@prisma/client';
import { isAfter, isBefore, isWeekend, parseISO, format, differenceInDays } from 'date-fns';
import { z } from 'zod';

/**
 * Advanced validation schemas and business rules for attendance data
 */

const attendanceDateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected YYYY-MM-DD')
  .transform((dateStr) => new Date(dateStr));

/*
// Base date validation with business rules
const attendanceDateSchema = z.string().refine(
  (dateStr) => {
    try {
      const date = parseISO(dateStr);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  },
  { message: 'Invalid date format. Expected ISO date string (YYYY-MM-DD)' }
).transform((dateStr) => parseISO(dateStr));
*/ 

// Enhanced attendance record validation
export const attendanceRecordValidationSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  cohortId: z.string().min(1, 'Cohort ID is required'),
  date: attendanceDateSchema,
  status: z.nativeEnum(AttendanceStatus, {
    errorMap: () => ({ message: 'Invalid attendance status' })
  }),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  recordedBy: z.string().min(1, 'Recorder ID is required'),
  recordedAt: z.date().optional()
}).refine(
  (data) => !isWeekend(data.date),
  {
    message: 'Attendance cannot be recorded for weekends',
    path: ['date']
  }
);

// Date range validation
export const dateRangeValidationSchema = z.object({
  startDate: attendanceDateSchema,
  endDate: attendanceDateSchema
}).refine(
  (data) => isBefore(data.startDate, data.endDate) || data.startDate.getTime() === data.endDate.getTime(),
  {
    message: 'Start date must be before or equal to end date',
    path: ['endDate']
  }
);

// Cohort validation with attendance-specific rules
export const cohortAttendanceValidationSchema = z.object({
  id: z.string().min(1, 'Cohort ID is required'),
  name: z.string().min(1, 'Cohort name is required'),
  startDate: z.date(),
  endDate: z.date().nullable(),
  isActive: z.boolean()
}).refine(
  (data) => !data.endDate || isAfter(data.endDate, data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

// Student validation for attendance tracking
export const studentAttendanceValidationSchema = z.object({
  id: z.string().min(1, 'Student ID is required'),
  name: z.string().min(1, 'Student name is required'),
  email: z.string().email('Invalid email format'),
  role: z.literal(UserRole.STUDENT),
  status: z.nativeEnum(UserStatus),
  cohortId: z.string().min(1, 'Cohort ID is required'),
  startDate: z.date().nullable(),
  endDate: z.date().nullable()
}).refine(
  (data) => data.status === UserStatus.ACTIVE,
  {
    message: 'Only active students can have attendance tracked',
    path: ['status']
  }
).refine(
  (data) => !data.endDate || !data.startDate || isAfter(data.endDate, data.startDate),
  {
    message: 'Student end date must be after start date',
    path: ['endDate']
  }
);

// User permission validation for attendance operations
export const attendancePermissionValidationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userRole: z.nativeEnum(UserRole),
  userStatus: z.nativeEnum(UserStatus),
  operation: z.enum(['view', 'create', 'update', 'delete', 'bulk_update', 'export']),
  resourceType: z.enum(['attendance', 'cohort', 'student']),
  resourceId: z.string().optional()
}).refine(
  (data) => data.userStatus === UserStatus.ACTIVE,
  {
    message: 'Only active users can perform attendance operations',
    path: ['userStatus']
  }
).refine(
  (data) => data.userRole === UserRole.ADMIN || data.userRole === UserRole.MENTOR,
  {
    message: 'Only admin and mentor users can access attendance features',
    path: ['userRole']
  }
);

// Export validation schema
export const attendanceExportValidationSchema = z.object({
  cohortId: z.string().min(1, 'Cohort ID is required'),
  format: z.enum(['csv', 'json', 'xlsx']),
  dateRange: dateRangeValidationSchema.optional(),
  includeStatistics: z.boolean().default(false),
  includeMetadata: z.boolean().default(true),
  studentIds: z.array(z.string()).optional()
});

// Import validation schema
export const attendanceImportValidationSchema = z.object({
  cohortId: z.string().min(1, 'Cohort ID is required'),
  format: z.enum(['csv', 'json']),
  data: z.string().min(1, 'Import data is required'),
  validateOnly: z.boolean().default(false),
  overwriteExisting: z.boolean().default(false)
});

/**
 * Business rule validation functions
 */

export interface BusinessRuleValidationContext {
  cohortStartDate: Date;
  cohortEndDate?: Date | null;
  currentDate: Date;
  allowFutureAttendance?: boolean;
  maxEditDays?: number;
  allowWeekendAttendance?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate attendance date against business rules
 */
export function validateAttendanceDate(
  date: Date,
  context: BusinessRuleValidationContext
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { 
    cohortStartDate, 
    cohortEndDate, 
    currentDate, 
    allowFutureAttendance = false,
    maxEditDays = 30,
    allowWeekendAttendance = false
  } = context;

  // Check if date is within cohort period
  if (isBefore(date, cohortStartDate)) {
    errors.push(`Attendance date ${format(date, 'yyyy-MM-dd')} is before cohort start date ${format(cohortStartDate, 'yyyy-MM-dd')}`);
  }

  if (cohortEndDate && isAfter(date, cohortEndDate)) {
    errors.push(`Attendance date ${format(date, 'yyyy-MM-dd')} is after cohort end date ${format(cohortEndDate, 'yyyy-MM-dd')}`);
  }

  // Check future date restrictions
  if (isAfter(date, currentDate) && !allowFutureAttendance) {
    errors.push(`Cannot record attendance for future date ${format(date, 'yyyy-MM-dd')}`);
  }

  // Check edit time window
  const daysDifference = differenceInDays(currentDate, date);
  if (daysDifference > maxEditDays) {
    warnings.push(`Attendance record is ${daysDifference} days old. Records older than ${maxEditDays} days should be reviewed.`);
  }

  // Check weekend restriction
  if (isWeekend(date) && !allowWeekendAttendance) {
    errors.push(`Attendance cannot be recorded for weekend date ${format(date, 'yyyy-MM-dd')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate attendance status transition
 */
export function validateAttendanceStatusTransition(
  fromStatus: AttendanceStatus | null,
  toStatus: AttendanceStatus,
  context: BusinessRuleValidationContext
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // If there's no previous status, any status is valid
  if (!fromStatus) {
    return { isValid: true, errors, warnings };
  }

  // Check for unnecessary changes
  if (fromStatus === toStatus) {
    warnings.push('Attendance status unchanged');
    return { isValid: true, errors, warnings };
  }

  // Business rule: Cannot change from PRESENT to any absent status after certain time
  const daysDifference = differenceInDays(context.currentDate, context.cohortStartDate);
  const maxEditDays = context.maxEditDays || 30;

  if (fromStatus === AttendanceStatus.PRESENT && daysDifference > maxEditDays) {
    warnings.push(`Changing from PRESENT to ${toStatus} after ${daysDifference} days. Please verify this change.`);
  }

  // Business rule: Multiple status changes in short period should be flagged
  if (fromStatus !== toStatus) {
    warnings.push(`Status changed from ${fromStatus} to ${toStatus}. Consider adding notes to explain the change.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate user permissions for attendance operations
 */
export function validateAttendancePermissions(
  userRole: UserRole,
  userStatus: UserStatus,
  operation: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check user status
  if (userStatus !== UserStatus.ACTIVE) {
    errors.push('Only active users can perform attendance operations');
    return { isValid: false, errors, warnings };
  }

  // Check role permissions
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.MENTOR) {
    errors.push(`Role ${userRole} is not authorized for attendance operations`);
    return { isValid: false, errors, warnings };
  }

  // Operation-specific validations
  switch (operation) {
    case 'view':
      // All authorized roles can view
      break;
    
    case 'create':
    case 'update':
      // All authorized roles can create/update
      break;
    
    case 'delete':
      // Only admins can delete attendance records
      if (userRole !== UserRole.ADMIN) {
        errors.push('Only administrators can delete attendance records');
      }
      break;
    
    case 'export':
      // All authorized roles can export
      break;
    
    default:
      errors.push(`Unknown operation: ${operation}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate attendance data consistency
 */
export function validateAttendanceConsistency(
  studentAttendanceData: Array<{
    studentId: string;
    date: string;
    status: AttendanceStatus;
    previousStatus?: AttendanceStatus;
  }>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Group by student
  const studentGroups = new Map<string, typeof studentAttendanceData>();
  studentAttendanceData.forEach(record => {
    if (!studentGroups.has(record.studentId)) {
      studentGroups.set(record.studentId, []);
    }
    studentGroups.get(record.studentId)!.push(record);
  });

  // Check each student's attendance pattern
  studentGroups.forEach((records, studentId) => {
    // Sort by date
    const sortedRecords = records.sort((a, b) => a.date.localeCompare(b.date));
    
    // Check for attendance patterns that might need attention
    let consecutiveAbsences = 0;
    let totalAbsences = 0;
    
    sortedRecords.forEach((record) => {
      if (record.status !== AttendanceStatus.PRESENT) {
        consecutiveAbsences++;
        totalAbsences++;
      } else {
        consecutiveAbsences = 0;
      }
      
      // Flag if student has been absent for 3+ consecutive days
      if (consecutiveAbsences >= 3) {
        warnings.push(`Student ${studentId} has ${consecutiveAbsences} consecutive absences ending on ${record.date}`);
      }
      
      // Check for suspicious status changes
      if (record.previousStatus && record.previousStatus !== record.status) {
        const currentDate = parseISO(record.date);
        const dayOfWeek = currentDate.getDay();
        
        // Flag if changing from present to absent on Monday (might indicate weekend issues)
        if (record.previousStatus === AttendanceStatus.PRESENT && 
            record.status !== AttendanceStatus.PRESENT && 
            dayOfWeek === 1) {
          warnings.push(`Student ${studentId} changed from present to absent on Monday ${record.date} - verify status`);
        }
      }
    });
    
    // Flag students with high absence rates in the current dataset
    const attendanceRate = ((sortedRecords.length - totalAbsences) / sortedRecords.length) * 100;
    if (attendanceRate < 75) {
      warnings.push(`Student ${studentId} has low attendance rate (${attendanceRate.toFixed(1)}%) in this dataset`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Comprehensive validation pipeline
 */
export async function validateAttendanceOperation(
  operation: {
    type: 'create' | 'update' | 'delete' | 'bulk_update' | 'export' | 'import';
    data: any;
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
    };
    context: BusinessRuleValidationContext & {
      expectedStudentIds?: string[];
      existingRecords?: Array<{
        studentId: string;
        date: string;
        status: AttendanceStatus;
      }>;
    };
  }
): Promise<ValidationResult> {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  try {
    // 1. Validate user permissions
    const permissionValidation = validateAttendancePermissions(
      operation.user.role,
      operation.user.status,
      operation.type
    );
    allErrors.push(...permissionValidation.errors);
    allWarnings.push(...permissionValidation.warnings);

    // 2. Operation-specific validation
    switch (operation.type) {
      case 'create':
      case 'update':
        const recordValidation = attendanceRecordValidationSchema.safeParse(operation.data);
        if (!recordValidation.success) {
          allErrors.push(...recordValidation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`));
        } else {
          const dateValidation = validateAttendanceDate(recordValidation.data.date, operation.context);
          allErrors.push(...dateValidation.errors);
          allWarnings.push(...dateValidation.warnings);
        }
        break;

      case 'export':
        const exportValidation = attendanceExportValidationSchema.safeParse(operation.data);
        if (!exportValidation.success) {
          allErrors.push(...exportValidation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`));
        }
        break;

      case 'import':
        const importValidation = attendanceImportValidationSchema.safeParse(operation.data);
        if (!importValidation.success) {
          allErrors.push(...importValidation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`));
        }
        break;
    }

    // 3. Data consistency validation if existing records are provided
    if (operation.context.existingRecords) {
      const consistencyValidation = validateAttendanceConsistency(operation.context.existingRecords);
      allErrors.push(...consistencyValidation.errors);
      allWarnings.push(...consistencyValidation.warnings);
    }

  } catch (error) {
    allErrors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

// All validation schemas are already exported above
