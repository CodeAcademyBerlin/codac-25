import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Prisma } from '@prisma/client'

import type { UpdateUserInput } from '@/lib/validation/user'

import { updateUser } from './update-user'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    logServerAction: vi.fn(),
    logDatabaseOperation: vi.fn(),
    logServerActionError: vi.fn(),
    logValidationError: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import mocked modules for type safety
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

describe('updateUser Server Action', () => {
  // Mock data
  const mockExistingUser = {
    id: 'clp9g8e4o0000q4a9rr3h7k8m',
    email: 'john@example.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    name: 'John Doe',
  }

  const mockUpdatedUser = {
    id: 'clp9g8e4o0000q4a9rr3h7k8m',
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Updated bio',
    role: 'STUDENT',
    status: 'ACTIVE',
    cohort: {
      id: 'cohort-123',
      name: 'Fall 2024',
      slug: 'fall-2024',
    },
    graduationDate: new Date('2024-12-01'),
    linkedinUrl: 'https://linkedin.com/in/johnsmith',
    githubUrl: 'https://github.com/johnsmith',
    portfolioUrl: 'https://johnsmith.dev',
    currentJob: 'Software Developer',
    currentCompany: 'Tech Corp',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockExistingUser as any)
    vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as any)
    vi.mocked(revalidatePath).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Successful user updates', () => {
    it('should update user with basic fields', async () => {
      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
        email: 'john.smith@example.com',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdatedUser)
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'clp9g8e4o0000q4a9rr3h7k8m' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          name: true,
        },
      })

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'clp9g8e4o0000q4a9rr3h7k8m' },
        data: {
          name: 'John Smith',
          email: 'john.smith@example.com',
        },
        select: expect.objectContaining({
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          role: true,
          status: true,
        }),
      })
    })

    it('should update user with all optional fields', async () => {
      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Updated bio',
        role: 'MENTOR',
        status: 'GRADUATED',
        cohort: 'Fall 2024',
        graduationDate: new Date('2024-12-01'),
        linkedinUrl: 'https://linkedin.com/in/johnsmith',
        githubUrl: 'https://github.com/johnsmith',
        portfolioUrl: 'https://johnsmith.dev',
        currentJob: 'Software Developer',
        currentCompany: 'Tech Corp',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(true)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'clp9g8e4o0000q4a9rr3h7k8m' },
        data: {
          name: 'John Smith',
          avatar: 'https://example.com/avatar.jpg',
          bio: 'Updated bio',
          role: 'MENTOR',
          status: 'GRADUATED',
          cohort: 'Fall 2024',
          graduationDate: new Date('2024-12-01'),
          linkedinUrl: 'https://linkedin.com/in/johnsmith',
          githubUrl: 'https://github.com/johnsmith',
          portfolioUrl: 'https://johnsmith.dev',
          currentJob: 'Software Developer',
          currentCompany: 'Tech Corp',
        },
        select: expect.any(Object),
      })
    })

    it('should handle partial updates filtering undefined values', async () => {
      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
        bio: undefined,
        avatar: 'https://example.com/avatar.jpg',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(true)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'clp9g8e4o0000q4a9rr3h7k8m' },
        data: {
          name: 'John Smith',
          avatar: 'https://example.com/avatar.jpg',
          // bio should not be included as it's undefined
        },
        select: expect.any(Object),
      })
    })

    it('should handle different user roles', async () => {
      const roles = ['STUDENT', 'ALUMNI', 'MENTOR', 'ADMIN'] as const

      for (const role of roles) {
        vi.clearAllMocks()
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockExistingUser as any)
        vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUpdatedUser, role } as any)

        const input: UpdateUserInput = {
          id: 'clp9g8e4o0000q4a9rr3h7k8m',
          role,
        }

        const result = await updateUser(input)

        expect(result.success).toBe(true)
        expect(prisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ role }),
          })
        )
      }
    })

    it('should handle different user statuses', async () => {
      const statuses = ['ACTIVE', 'INACTIVE', 'GRADUATED'] as const

      for (const status of statuses) {
        vi.clearAllMocks()
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockExistingUser as any)
        vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUpdatedUser, status } as any)

        const input: UpdateUserInput = {
          id: 'clp9g8e4o0000q4a9rr3h7k8m',
          status,
        }

        const result = await updateUser(input)

        expect(result.success).toBe(true)
        expect(prisma.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ status }),
          })
        )
      }
    })

    it('should revalidate paths correctly', async () => {
      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
      }

      await updateUser(input)

      expect(revalidatePath).toHaveBeenCalledWith('/admin/users')
      expect(revalidatePath).toHaveBeenCalledWith('/users')
      expect(revalidatePath).toHaveBeenCalledWith('/users/clp9g8e4o0000q4a9rr3h7k8m')
      expect(revalidatePath).toHaveBeenCalledTimes(3)
    })

    it('should log operations correctly', async () => {
      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
        email: 'john.smith@example.com',
      }

      await updateUser(input)

      expect(logger.logServerAction).toHaveBeenCalledWith('update', 'user', {
        resourceId: 'clp9g8e4o0000q4a9rr3h7k8m',
        metadata: {
          updateFields: ['name', 'email'],
          email: 'john.smith@example.com'
        }
      })

      expect(logger.logDatabaseOperation).toHaveBeenCalledWith('update', 'user', 'clp9g8e4o0000q4a9rr3h7k8m', {
        metadata: {
          updatedFields: ['name', 'email'],
          email: 'john.smith@example.com',
          role: 'STUDENT'
        }
      })

      expect(logger.info).toHaveBeenCalledWith('User updated successfully', {
        action: 'update',
        resource: 'user',
        resourceId: 'clp9g8e4o0000q4a9rr3h7k8m',
        metadata: {
          duration: expect.any(Number),
          updatedFields: ['name', 'email'],
          email: 'john.smith@example.com',
          role: 'STUDENT'
        }
      })
    })
  })

  describe('User not found errors', () => {
    it('should return error when user does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m', // Valid CUID format
        name: 'John Smith',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(false)
      expect(typeof result.error).toBe('string')
      expect(prisma.user.update).not.toHaveBeenCalled()
    })
  })

  describe('Email conflict errors', () => {
    it('should return error when email already exists for different user', async () => {
      const conflictingUser = { id: 'other-clp9g8e4o0000q4a9rr3h7k8m' }
      
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockExistingUser as any) // First call for user existence
        .mockResolvedValueOnce(conflictingUser as any) // Second call for email conflict

      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        email: 'conflicting@example.com',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('A user with this email already exists')
      expect(prisma.user.update).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledWith('User update failed: email already exists', {
        action: 'update',
        resource: 'user',
        resourceId: 'clp9g8e4o0000q4a9rr3h7k8m',
        metadata: { conflictingEmail: 'conflicting@example.com' }
      })
    })

    it('should allow email update when email belongs to same user', async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockExistingUser as any) // First call for user existence
        .mockResolvedValueOnce(null) // Second call for email conflict (no conflict)

      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        email: 'john@example.com', // Same email as existing user
      }

      const result = await updateUser(input)

      expect(result.success).toBe(true)
      expect(prisma.user.update).toHaveBeenCalled()
    })

    it('should skip email conflict check when email is not being updated', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockExistingUser as any)

      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
      }

      await updateUser(input)

      // Should only check for user existence, not email conflicts
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1)
    })
  })

  describe('Validation errors', () => {
    it('should handle Zod validation errors', async () => {
      const input: UpdateUserInput = {
        id: 'invalid-cuid-format', // Invalid CUID will trigger validation error
        email: 'valid@example.com',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(false)
      expect(Array.isArray(result.error)).toBe(true)
      if (!result.success && Array.isArray(result.error)) {
        expect(result.error.length).toBeGreaterThan(0)
        expect(result.error.some(err => err.path?.includes('id'))).toBe(true)
      }
    })
  })

  describe('Database errors', () => {
    it('should handle P2002 (unique constraint) error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '5.0.0' }
      )

      vi.mocked(prisma.user.update).mockRejectedValue(prismaError)

      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        email: 'existing@example.com',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('A user with this email already exists')
    })

    it('should handle P2025 (record not found) error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '5.0.0' }
      )

      vi.mocked(prisma.user.update).mockRejectedValue(prismaError)

      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })

    it('should handle unknown Prisma errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unknown database error',
        { code: 'P0000', clientVersion: '5.0.0' }
      )

      vi.mocked(prisma.user.update).mockRejectedValue(prismaError)

      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error occurred')
    })

    it('should handle unknown errors', async () => {
      const unknownError = new Error('Network connection failed')
      vi.mocked(prisma.user.update).mockRejectedValue(unknownError)

      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to update user')
      expect(logger.logServerActionError).toHaveBeenCalledWith(
        'update',
        'user',
        unknownError,
        {
          resourceId: 'clp9g8e4o0000q4a9rr3h7k8m',
          metadata: expect.objectContaining({
            duration: expect.any(Number),
            updateFields: ['name'],
          }),
        }
      )
    })

    it('should handle non-Error objects thrown', async () => {
      vi.mocked(prisma.user.update).mockRejectedValue('String error')

      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to update user')
      expect(logger.logServerActionError).toHaveBeenCalledWith(
        'update',
        'user',
        expect.any(Error),
        expect.any(Object)
      )
    })
  })

  describe('Avatar validation', () => {
    it('should accept valid URL avatars', async () => {
      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        avatar: 'https://example.com/avatar.jpg',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(true)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            avatar: 'https://example.com/avatar.jpg',
          }),
        })
      )
    })

    it('should accept valid base64 data URI avatars', async () => {
      const base64Avatar = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...'
      
      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        avatar: base64Avatar,
      }

      const result = await updateUser(input)

      expect(result.success).toBe(true)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            avatar: base64Avatar,
          }),
        })
      )
    })
  })

  describe('URL field validation', () => {
    it('should accept valid social media URLs', async () => {
      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        linkedinUrl: 'https://linkedin.com/in/johnsmith',
        githubUrl: 'https://github.com/johnsmith',
        portfolioUrl: 'https://johnsmith.dev',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(true)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            linkedinUrl: 'https://linkedin.com/in/johnsmith',
            githubUrl: 'https://github.com/johnsmith',
            portfolioUrl: 'https://johnsmith.dev',
          }),
        })
      )
    })

    it('should accept empty strings for optional URL fields', async () => {
      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: '',
      }

      const result = await updateUser(input)

      expect(result.success).toBe(true)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            linkedinUrl: '',
            githubUrl: '',
            portfolioUrl: '',
          }),
        })
      )
    })
  })

  describe('Performance and logging', () => {
    it('should measure and log execution duration', async () => {
      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
      }

      const startTime = Date.now()
      await updateUser(input)
      const endTime = Date.now()

      expect(logger.info).toHaveBeenCalledWith('User updated successfully', 
        expect.objectContaining({
          metadata: expect.objectContaining({
            duration: expect.any(Number)
          })
        })
      )

      // Verify duration is reasonable
      const logCall = vi.mocked(logger.info).mock.calls.find(call => 
        call[1]?.metadata?.duration !== undefined
      )
      const loggedDuration = logCall?.[1]?.metadata?.duration
      expect(loggedDuration).toBeGreaterThanOrEqual(0)
      expect(loggedDuration).toBeLessThan(endTime - startTime + 100) // Add small buffer
    })

    it('should log error duration on failures', async () => {
      const error = new Error('Database error')
      vi.mocked(prisma.user.update).mockRejectedValue(error)

      const input: UpdateUserInput = {
        id: 'clp9g8e4o0000q4a9rr3h7k8m',
        name: 'John Smith',
      }

      await updateUser(input)

      expect(logger.logServerActionError).toHaveBeenCalledWith(
        'update',
        'user',
        error,
        expect.objectContaining({
          resourceId: 'clp9g8e4o0000q4a9rr3h7k8m',
          metadata: expect.objectContaining({
            duration: expect.any(Number),
            updateFields: ['name']
          })
        })
      )
    })
  })
})