import { Prisma } from '@prisma/client';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Import actual implementation for testing
const serverActionUtils = (await vi.importActual(
  './server-action-utils'
)) as any;
const {
  handlePrismaError,
  handleValidationError,
  createServerAction,
  checkPermission,
} = serverActionUtils;

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    logServerAction: vi.fn(),
    logServerActionError: vi.fn(),
    logDatabaseOperation: vi.fn(),
    logValidationError: vi.fn(),
  },
}));

describe('Server Action Utils', () => {
  describe('handlePrismaError', () => {
    it('should handle P2002 unique constraint error', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        }
      );

      const result = handlePrismaError(error);
      expect(result).toBe('A record with this information already exists');
    });

    it('should handle P2003 foreign key constraint error', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
        }
      );

      const result = handlePrismaError(error);
      expect(result).toBe('Invalid reference to related record');
    });

    it('should handle P2025 record not found error', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Record to delete does not exist',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        }
      );

      const result = handlePrismaError(error);
      expect(result).toBe('Record not found');
    });

    it('should handle P2014 invalid data error', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'The change you are trying to make would violate the required relation',
        {
          code: 'P2014',
          clientVersion: '5.0.0',
        }
      );

      const result = handlePrismaError(error);
      expect(result).toBe('Invalid data provided');
    });

    it('should handle P2001 required record not found error', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'The record searched for in the where condition does not exist',
        {
          code: 'P2001',
          clientVersion: '5.0.0',
        }
      );

      const result = handlePrismaError(error);
      expect(result).toBe('Required record not found');
    });

    it('should handle unknown Prisma error codes', () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unknown error', {
        code: 'P9999',
        clientVersion: '5.0.0',
      });

      const result = handlePrismaError(error);
      expect(result).toBe('Database error occurred');
    });

    it('should log unhandled Prisma errors', async () => {
      const { logger } = await import('@/lib/logger');
      const error = new Prisma.PrismaClientKnownRequestError('Unknown error', {
        code: 'P9999',
        clientVersion: '5.0.0',
      });

      handlePrismaError(error);
      expect(logger.error).toHaveBeenCalledWith(
        'Unhandled Prisma error',
        error
      );
    });
  });

  describe('handleValidationError', () => {
    it('should handle ZodError instances', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
        },
      ]);
      zodError.name = 'ZodError';

      const result = handleValidationError(zodError);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(zodError.issues);
    });

    it('should handle non-Zod errors', () => {
      const regularError = new Error('Regular error');
      const result = handleValidationError(regularError);
      expect(result).toBe('Validation failed');
    });

    it('should handle non-error objects', () => {
      const result = handleValidationError('string error');
      expect(result).toBe('Validation failed');
    });

    it('should handle null/undefined', () => {
      expect(handleValidationError(null)).toBe('Validation failed');
      expect(handleValidationError(undefined)).toBe('Validation failed');
    });
  });

  describe('createServerAction', () => {
    const mockSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create successful server action', async () => {
      const mockHandler = vi
        .fn()
        .mockResolvedValue({ id: '123', success: true });
      const action = createServerAction(
        mockSchema,
        mockHandler,
        'create',
        'user'
      );

      const input = { name: 'John', email: 'john@example.com' };
      const result = await action(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: '123', success: true });
      }
      expect(mockHandler).toHaveBeenCalledWith(input);
    });

    it('should handle validation errors', async () => {
      const mockHandler = vi.fn();
      const action = createServerAction(
        mockSchema,
        mockHandler,
        'create',
        'user'
      );

      const invalidInput = { name: '', email: 'invalid-email' };
      const result = await action(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(Array.isArray(result.error)).toBe(true);
      }
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle Prisma errors from handler', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        }
      );
      const mockHandler = vi.fn().mockRejectedValue(prismaError);
      const action = createServerAction(
        mockSchema,
        mockHandler,
        'create',
        'user'
      );

      const input = { name: 'John', email: 'john@example.com' };
      const result = await action(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(
          'A record with this information already exists'
        );
      }
    });

    it('should handle generic errors from handler', async () => {
      const genericError = new Error('Something went wrong');
      const mockHandler = vi.fn().mockRejectedValue(genericError);
      const action = createServerAction(
        mockSchema,
        mockHandler,
        'create',
        'user'
      );

      const input = { name: 'John', email: 'john@example.com' };
      const result = await action(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('An unexpected error occurred');
      }
    });

    it('should log server action start and completion', async () => {
      const { logger } = await import('@/lib/logger');
      const mockHandler = vi.fn().mockResolvedValue({ success: true });
      const action = createServerAction(
        mockSchema,
        mockHandler,
        'create',
        'user'
      );

      const input = { name: 'John', email: 'john@example.com' };
      await action(input);

      expect(logger.logServerAction).toHaveBeenCalledWith('create', 'user', {
        metadata: {
          inputKeys: ['name', 'email'],
        },
      });
      expect(logger.info).toHaveBeenCalledWith(
        'Server action completed: create',
        expect.objectContaining({
          action: 'create',
          resource: 'user',
          metadata: expect.objectContaining({
            duration: expect.any(Number),
            success: true,
          }),
        })
      );
    });

    it('should log server action errors', async () => {
      const { logger } = await import('@/lib/logger');
      const error = new Error('Handler error');
      const mockHandler = vi.fn().mockRejectedValue(error);
      const action = createServerAction(
        mockSchema,
        mockHandler,
        'create',
        'user'
      );

      const input = { name: 'John', email: 'john@example.com' };
      await action(input);

      expect(logger.logServerActionError).toHaveBeenCalledWith(
        'create',
        'user',
        error,
        {
          metadata: {
            duration: expect.any(Number),
            inputKeys: ['name', 'email'],
          },
        }
      );
    });

    it('should work without action name and resource name', async () => {
      const mockHandler = vi.fn().mockResolvedValue({ success: true });
      const action = createServerAction(mockSchema, mockHandler);

      const input = { name: 'John', email: 'john@example.com' };
      const result = await action(input);

      expect(result.success).toBe(true);
    });

    it('should measure execution duration', async () => {
      const { logger } = await import('@/lib/logger');
      const mockHandler = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { success: true };
      });
      const action = createServerAction(
        mockSchema,
        mockHandler,
        'create',
        'user'
      );

      const input = { name: 'John', email: 'john@example.com' };
      await action(input);

      expect(logger.info).toHaveBeenCalledWith(
        'Server action completed: create',
        expect.objectContaining({
          metadata: expect.objectContaining({
            duration: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('checkPermission', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return true for valid userId', async () => {
      const result = await checkPermission('user-123', 'document', 'read');
      expect(result).toBe(true);
    });

    it('should return false for empty userId', async () => {
      const { logger } = await import('@/lib/logger');
      const result = await checkPermission('', 'document', 'read');

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        'Permission check failed: No user ID provided',
        {
          action: 'permission_check',
          resource: 'document',
          metadata: { action: 'read', resourceId: undefined },
        }
      );
    });

    it('should return false for null userId', async () => {
      const result = await checkPermission(null as any, 'document', 'read');
      expect(result).toBe(false);
    });

    it('should return false for undefined userId', async () => {
      const result = await checkPermission(
        undefined as any,
        'document',
        'read'
      );
      expect(result).toBe(false);
    });

    it('should log permission checks', async () => {
      const { logger } = await import('@/lib/logger');
      await checkPermission('user-123', 'document', 'read', 'doc-456');

      expect(logger.debug).toHaveBeenCalledWith('Checking permission', {
        action: 'permission_check',
        resource: 'document',
        userId: 'user-123',
        metadata: { action: 'read', resourceId: 'doc-456' },
      });
    });

    it('should include resourceId in metadata when provided', async () => {
      const { logger } = await import('@/lib/logger');

      expect(logger.debug).toHaveBeenCalledWith('Checking permission', {
        action: 'permission_check',
        resource: 'document',
        userId: 'user-123',
        metadata: { action: 'update', resourceId: 'doc-789' },
      });
    });
  });
});
