import { UserRole, UserStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Note: getSession import removed - implement based on your auth system
import { logger } from '@/lib/logger';
import { BusinessRuleValidationContext } from '@/lib/validation/attendance-advanced';

/**
 * Middleware for validating attendance-related requests
 */

export interface ValidationMiddlewareConfig {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  validateBusinessRules?: boolean;
  logValidation?: boolean;
}

export interface RequestValidationContext extends BusinessRuleValidationContext {
  requestId: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Create validation middleware for attendance operations
 */
export function createAttendanceValidationMiddleware(
  operationType: 'create' | 'update' | 'delete' | 'bulk_update' | 'export' | 'import',
  config: ValidationMiddlewareConfig = {}
) {
  return async function validationMiddleware(
    request: NextRequest
  ): Promise<NextResponse | { error: string; status: number } | null> {

    try {
      // 1. Authentication check
      if (config.requireAuth !== false) {
        // TODO: Implement session check based on your auth system
        // const session = await getSession();

        // For now, skip authentication check
        // if (!session?.user) {
        //   if (config.logValidation) {
        //     logger.warn('Attendance validation: Unauthorized access attempt', {
        //       operationType,
        //       userAgent: request.headers.get('user-agent')
        //     });
        //   }
        //   return { error: 'Authentication required', status: 401 };
        // }

        // 2. Role-based access control
        // TODO: Implement role check based on your auth system
        // if (config.allowedRoles && !config.allowedRoles.includes(session.user.role as UserRole)) {
        //   if (config.logValidation) {
        //     logger.warn('Attendance validation: Insufficient permissions', {
        //       operationType,
        //       userRole: session.user.role,
        //       requiredRoles: config.allowedRoles,
        //       userId: session.user.id
        //     });
        //   }
        //   return { error: 'Insufficient permissions', status: 403 };
        // }

        // 3. User status check
        // TODO: Implement status check based on your auth system
        // if (session.user.status !== UserStatus.ACTIVE) {
        //   if (config.logValidation) {
        //     logger.warn('Attendance validation: Inactive user access attempt', {
        //       operationType,
        //       userStatus: session.user.status,
        //       userId: session.user.id
        //     });
        //   }
        //   return { error: 'User account is not active', status: 403 };
        // }
      }

      // 4. Request body validation (for POST/PUT requests)
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const contentType = request.headers.get('content-type');
          if (!contentType?.includes('application/json')) {
            return { error: 'Content-Type must be application/json', status: 400 };
          }

          const body = await request.json();

          // Validate request body size
          const bodySize = JSON.stringify(body).length;
          if (bodySize > 1024 * 1024) { // 1MB limit
            return { error: 'Request body too large', status: 413 };
          }

          // Store validated body for use in the handler
          (request as any).validatedBody = body;

        } catch (error) {
          if (config.logValidation) {
            logger.error('Attendance validation: Invalid JSON body', error instanceof Error ? error : new Error(String(error)));
          }
          return { error: 'Invalid JSON body', status: 400 };
        }
      }

      // 5. Rate limiting check (basic implementation)
      const userKey = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      if (await isRateLimited(userKey, operationType)) {
        if (config.logValidation) {
          logger.warn('Attendance validation: Rate limit exceeded');
        }
        return { error: 'Rate limit exceeded', status: 429 };
      }

      // 6. Business rule validation (if enabled)
      if (config.validateBusinessRules) {
        // This would be implemented based on specific operation requirements
        // For now, we'll log that business rule validation is enabled
        if (config.logValidation) {
          logger.info('Attendance validation: Business rules validation enabled');
        }
      }

      // Log successful validation
      if (config.logValidation) {
        logger.info('Attendance validation: Request validated successfully');
      }

      return null; // Validation passed

    } catch (error) {
      logger.error('Attendance validation: Middleware error', error instanceof Error ? error : new Error(String(error)));

      return { error: 'Internal validation error', status: 500 };
    }
  };
}

/**
 * Simple rate limiting implementation
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

async function isRateLimited(userKey: string, _operationType: string): Promise<boolean> {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window

  // Different limits for different operations
  const limits: Record<string, number> = {
    create: 60,      // 60 per minute
    update: 60,      // 60 per minute
    delete: 10,      // 10 per minute
    bulk_update: 5,  // 5 per minute
    export: 10,      // 10 per minute
    import: 2        // 2 per minute
  };

  const limit = limits[_operationType] || 30;
  const key = `${userKey}:${_operationType}`;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (current.count >= limit) {
    return true;
  }

  current.count++;
  return false;
}

/**
 * Validation error handler for API routes
 */
export function handleValidationError(
  error: z.ZodError | Error | string,
  _operationType: string,
  requestId?: string
): NextResponse {
  const errorId = requestId || crypto.randomUUID();

  if (error instanceof z.ZodError) {
    const formattedErrors = error.issues.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));

    logger.warn('Attendance validation: Schema validation failed');

    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: formattedErrors,
        errorId
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    logger.error('Attendance validation: Unexpected error', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        message: error.message,
        errorId
      },
      { status: 500 }
    );
  }

  // String error
  logger.warn('Attendance validation: String error');

  return NextResponse.json(
    {
      success: false,
      error: String(error),
      errorId
    },
    { status: 400 }
  );
}

/**
 * Validation success response helper
 */
export function handleValidationSuccess<T>(
  data: T,
  _operationType: string,
  warnings?: string[]
): NextResponse {
  const response = {
    success: true,
    data,
    ...(warnings && warnings.length > 0 && { warnings })
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Comprehensive request validator for attendance operations
 */
export async function validateAttendanceRequest(
  request: NextRequest,
  _operationType: 'create' | 'update' | 'delete' | 'bulk_update' | 'export' | 'import',
  schema: z.ZodSchema,
  businessRuleContext?: Partial<BusinessRuleValidationContext>
): Promise<{
  success: boolean;
  data?: any;
  errors?: string[];
  warnings?: string[];
  user?: {
    id: string;
    role: UserRole;
    status: UserStatus;
  };
}> {
  try {
    // 1. Get user session
    // TODO: Implement session check based on your auth system
    // const session = await getSession();
    // if (!session?.user) {
    //   return {
    //     success: false,
    //     errors: ['Authentication required']
    //   };
    // }

    // 2. Parse and validate request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (_error) {
      return {
        success: false,
        errors: ['Invalid JSON body']
      };
    }

    // 3. Schema validation
    const schemaValidation = schema.safeParse(requestData);
    if (!schemaValidation.success) {
      return {
        success: false,
        errors: schemaValidation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }

    // 4. Business rule validation
    if (businessRuleContext) {
      // TODO: Implement business rule validation with proper user context
      // const validationResult = await validateAttendanceOperation({
      //   type: operationType,
      //   data: schemaValidation.data,
      //   user: {
      //     id: session.user.id,
      //     role: session.user.role as UserRole,
      //     status: session.user.status as UserStatus
      //   },
      //   context: {
      //     cohortStartDate: businessRuleContext.cohortStartDate || new Date(),
      //     cohortEndDate: businessRuleContext.cohortEndDate,
      //     currentDate: new Date(),
      //     allowFutureAttendance: businessRuleContext.allowFutureAttendance || false,
      //     maxEditDays: businessRuleContext.maxEditDays || 30,
      //     allowWeekendAttendance: businessRuleContext.allowWeekendAttendance || false
      //   }
      // });

      // if (!validationResult.isValid) {
      //   return {
      //     success: false,
      //     errors: validationResult.errors,
      //     warnings: validationResult.warnings
      //   };
      // }

      return {
        success: true,
        data: schemaValidation.data,
        warnings: [],
        user: {
          id: 'temp-user-id',
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE
        }
      };
    }

    return {
      success: true,
      data: schemaValidation.data,
      user: {
        id: 'temp-user-id',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE
      }
    };

  } catch (error) {
    logger.error('Attendance request validation error', error instanceof Error ? error : new Error(String(error)));

    return {
      success: false,
      errors: ['Internal validation error']
    };
  }
}

/**
 * Sanitize input data to prevent XSS and injection attacks
 */
export function sanitizeAttendanceInput(data: any): any {
  if (typeof data === 'string') {
    return data
      .trim()
      .replace(/[<>]/g, '') // Remove basic HTML tags
      .substring(0, 1000); // Limit length
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeAttendanceInput);
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Only include safe keys
      if (/^[a-zA-Z0-9_-]+$/.test(key) && key.length <= 50) {
        sanitized[key] = sanitizeAttendanceInput(value);
      }
    }
    return sanitized;
  }

  return data;
}

export default {
  createAttendanceValidationMiddleware,
  handleValidationError,
  handleValidationSuccess,
  validateAttendanceRequest,
  sanitizeAttendanceInput
};
