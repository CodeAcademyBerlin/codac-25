import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Prisma } from '@prisma/client'

import type { CreateDocInput } from '@/lib/validation/doc'

import { createDoc } from './create-doc'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    document: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    logServerAction: vi.fn(),
    logDatabaseOperation: vi.fn(),
    logServerActionError: vi.fn(),
    logValidationError: vi.fn(),
  },
}))

vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/server-action-utils', () => ({
  handlePrismaError: vi.fn(),
}))

// Import mocked modules for type safety
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { auth } from '@/lib/auth/auth'
import { revalidatePath } from 'next/cache'
import { handlePrismaError } from '@/lib/server-action-utils'

describe('createDoc Server Action', () => {
  // Mock data
  const mockUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
  }

  const mockSession = {
    user: mockUser,
  }

  const mockDocument = {
    id: 'doc-123',
    title: 'Test Document',
    content: [{ type: 'p', children: [{ text: '' }] }],
    parentId: null,
    isFolder: false,
    type: 'GENERAL',
    authorId: 'user-123',
    isPublished: false,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue(mockSession as any)
    vi.mocked(prisma.document.create).mockResolvedValue(mockDocument as any)
    vi.mocked(revalidatePath).mockResolvedValue(undefined)
    vi.mocked(handlePrismaError).mockReturnValue('Database error occurred')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Successful document creation', () => {
    it('should create a document with minimal required data', async () => {
      const input: CreateDocInput = {
        title: 'Test Document',
        type: 'GENERAL',
      }

      const result = await createDoc(input)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDocument)
      expect(prisma.document.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Document',
          content: [{ type: 'p', children: [{ text: '' }] }],
          parentId: undefined,
          isFolder: false,
          type: 'GENERAL',
          authorId: 'user-123',
          isPublished: false,
          isArchived: false,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    })

    it('should create a document with all optional fields', async () => {
      const input: CreateDocInput = {
        title: 'Complete Document',
        content: [{ type: 'h1', children: [{ text: 'Heading' }] }],
        parentId: 'parent-123',
        isFolder: true,
        type: 'COURSE_MATERIAL',
      }

      const mockFolderDocument = {
        ...mockDocument,
        title: 'Complete Document',
        content: [{ type: 'h1', children: [{ text: 'Heading' }] }],
        parentId: 'parent-123',
        isFolder: true,
        type: 'COURSE_MATERIAL',
      }

      vi.mocked(prisma.document.create).mockResolvedValue(mockFolderDocument as any)

      const result = await createDoc(input)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockFolderDocument)
      expect(prisma.document.create).toHaveBeenCalledWith({
        data: {
          title: 'Complete Document',
          content: [{ type: 'h1', children: [{ text: 'Heading' }] }],
          parentId: 'parent-123',
          isFolder: true,
          type: 'COURSE_MATERIAL',
          authorId: 'user-123',
          isPublished: false,
          isArchived: false,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    })

    it('should create folder with empty array content when isFolder is true', async () => {
      const input: CreateDocInput = {
        title: 'Test Folder',
        isFolder: true,
        type: 'GENERAL',
      }

      const result = await createDoc(input)

      expect(prisma.document.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Folder',
          content: [],
          parentId: undefined,
          isFolder: true,
          type: 'GENERAL',
          authorId: 'user-123',
          isPublished: false,
          isArchived: false,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    })

    it('should handle different document types', async () => {
      const types = ['GENERAL', 'COURSE_MATERIAL', 'ASSIGNMENT', 'RESOURCE'] as const

      for (const type of types) {
        vi.clearAllMocks()
        vi.mocked(auth).mockResolvedValue(mockSession as any)
        vi.mocked(prisma.document.create).mockResolvedValue(mockDocument as any)

        const input: CreateDocInput = {
          title: `${type} Document`,
          type,
        }

        const result = await createDoc(input)

        expect(result.success).toBe(true)
        expect(prisma.document.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              type,
              title: `${type} Document`,
            }),
          })
        )
      }
    })

    it('should revalidate paths correctly', async () => {
      const input: CreateDocInput = {
        title: 'Test Document',
        parentId: 'parent-123',
        type: 'GENERAL',
      }

      const mockDocWithParent = {
        ...mockDocument,
        parentId: 'parent-123',
      }

      vi.mocked(prisma.document.create).mockResolvedValue(mockDocWithParent as any)

      await createDoc(input)

      expect(revalidatePath).toHaveBeenCalledWith('/docs')
      expect(revalidatePath).toHaveBeenCalledWith('/docs/parent-123')
    })

    it('should only revalidate /docs when no parentId', async () => {
      const input: CreateDocInput = {
        title: 'Root Document',
        type: 'GENERAL',
      }

      await createDoc(input)

      expect(revalidatePath).toHaveBeenCalledWith('/docs')
      expect(revalidatePath).toHaveBeenCalledTimes(1)
    })

    it('should log operations correctly', async () => {
      const input: CreateDocInput = {
        title: 'Test Document',
        parentId: 'parent-123',
        type: 'GENERAL',
      }

      await createDoc(input)

      expect(logger.logServerAction).toHaveBeenCalledWith('create', 'document', {
        metadata: { title: 'Test Document', parentId: 'parent-123' }
      })
      expect(logger.logDatabaseOperation).toHaveBeenCalledWith('create', 'document', 'doc-123', {
        metadata: { title: 'Test Document', authorId: 'user-123' }
      })
      expect(logger.logServerAction).toHaveBeenCalledWith('create', 'document', {
        metadata: {
          documentId: 'doc-123',
          duration: expect.any(Number)
        }
      })
    })
  })

  describe('Authentication errors', () => {
    it('should return error when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      const input: CreateDocInput = {
        title: 'Test Document',
        type: 'GENERAL',
      }

      const result = await createDoc(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication required')
      expect(prisma.document.create).not.toHaveBeenCalled()
    })

    it('should return error when session has no user', async () => {
      vi.mocked(auth).mockResolvedValue({ user: null } as any)

      const input: CreateDocInput = {
        title: 'Test Document',
        type: 'GENERAL',
      }

      const result = await createDoc(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication required')
      expect(prisma.document.create).not.toHaveBeenCalled()
    })

    it('should return error when user has no id', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { name: 'John' } } as any)

      const input: CreateDocInput = {
        title: 'Test Document',
        type: 'GENERAL',
      }

      const result = await createDoc(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication required')
      expect(prisma.document.create).not.toHaveBeenCalled()
    })
  })

  describe('Validation errors', () => {
    it('should handle Zod validation errors', async () => {
      // Invalid input with missing required fields
      const input = {} as CreateDocInput

      const result = await createDoc(input)

      expect(result.success).toBe(false)
      expect(Array.isArray(result.error)).toBe(true)
      if (!result.success && Array.isArray(result.error)) {
        expect(result.error.length).toBeGreaterThan(0)
        expect(result.error.some(err => err.path?.includes('title'))).toBe(true)
        expect(result.error.some(err => err.path?.includes('type'))).toBe(true)
      }
    })
  })

  describe('Database errors', () => {
    it('should handle Prisma known request errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        { code: 'P2003', clientVersion: '5.0.0' }
      )

      vi.mocked(prisma.document.create).mockRejectedValue(prismaError)
      vi.mocked(handlePrismaError).mockReturnValue('Invalid parent document')

      const input: CreateDocInput = {
        title: 'Test Document',
        parentId: 'invalid-parent',
        type: 'GENERAL',
      }

      const result = await createDoc(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid parent document')
      expect(handlePrismaError).toHaveBeenCalledWith(prismaError)
    })

    it('should handle unknown database errors', async () => {
      const unknownError = new Error('Database connection failed')
      vi.mocked(prisma.document.create).mockRejectedValue(unknownError)

      const input: CreateDocInput = {
        title: 'Test Document',
        type: 'GENERAL',
      }

      const result = await createDoc(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create document')
      expect(logger.logServerActionError).toHaveBeenCalledWith(
        'create',
        'document',
        unknownError,
        expect.objectContaining({
          metadata: expect.objectContaining({
            title: 'Test Document',
            duration: expect.any(Number),
          }),
        })
      )
    })

    it('should handle non-Error objects thrown', async () => {
      vi.mocked(prisma.document.create).mockRejectedValue('String error')

      const input: CreateDocInput = {
        title: 'Test Document',
        type: 'GENERAL',
      }

      const result = await createDoc(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create document')
      expect(logger.logServerActionError).toHaveBeenCalledWith(
        'create',
        'document',
        expect.any(Error),
        expect.any(Object)
      )
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string parentId', async () => {
      const input: CreateDocInput = {
        title: 'Test Document',
        parentId: '',
        type: 'GENERAL',
      }

      await createDoc(input)

      expect(prisma.document.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            parentId: '', // Empty string is valid (means no parent)
          }),
        })
      )
    })

    it('should handle undefined isFolder correctly', async () => {
      const input: CreateDocInput = {
        title: 'Test Document',
        type: 'GENERAL',
      }

      await createDoc(input)

      expect(prisma.document.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isFolder: false, // Should default to false
          }),
        })
      )
    })

    it('should handle custom content for folders', async () => {
      const input: CreateDocInput = {
        title: 'Custom Folder',
        content: [{ type: 'custom', data: 'test' }],
        isFolder: true,
        type: 'GENERAL',
      }

      await createDoc(input)

      expect(prisma.document.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: [{ type: 'custom', data: 'test' }], // Custom content should be preserved
          }),
        })
      )
    })

    it('should measure and log execution duration', async () => {
      const input: CreateDocInput = {
        title: 'Test Document',
        type: 'GENERAL',
      }

      const startTime = Date.now()
      await createDoc(input)
      const endTime = Date.now()

      expect(logger.logServerAction).toHaveBeenLastCalledWith('create', 'document', {
        metadata: {
          documentId: 'doc-123',
          duration: expect.any(Number)
        }
      })

      // Verify duration is reasonable (should be less than test execution time)
      const logCall = vi.mocked(logger.logServerAction).mock.calls.find(call => 
        call[2]?.metadata?.duration !== undefined
      )
      const loggedDuration = logCall?.[2]?.metadata?.duration
      expect(loggedDuration).toBeGreaterThanOrEqual(0)
      expect(loggedDuration).toBeLessThan(endTime - startTime + 100) // Add small buffer
    })
  })
})