import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Prisma } from '@prisma/client'

import { mockUserPrivate } from '@/tests/utils/fixtures'

// Mock the database module
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Import after mocking
import { createUser } from './create-user'
import { prisma } from '@/lib/db'

// Get references to the mocked functions
const mockPrisma = vi.mocked(prisma)

describe('createUser Server Action', () => {
  const validUserData = {
    email: 'test@example.com',
    name: 'Test User',
    role: 'STUDENT' as const,
    status: 'ACTIVE' as const,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a user successfully', async () => {
    // Mock Prisma responses
    mockPrisma.user.findUnique.mockResolvedValue(null) // No existing user
    mockPrisma.user.create.mockResolvedValue(mockUserPrivate)

    const result = await createUser(validUserData)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(expect.objectContaining({
        email: mockUserPrivate.email,
        name: mockUserPrivate.name,
        role: mockUserPrivate.role,
        status: mockUserPrivate.status,
      }))
    }

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: validUserData.email },
      select: { id: true, email: true },
    })

    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: validUserData,
      select: expect.any(Object), // commonSelects.userPrivate
    })
  })

  it('should return error when user with email already exists', async () => {
    // Mock existing user
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'existing-user-id',
      email: validUserData.email,
    })

    const result = await createUser(validUserData)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('A user with this email already exists')
    }

    expect(mockPrisma.user.create).not.toHaveBeenCalled()
  })

  it('should handle validation errors', async () => {
    const invalidUserData = {
      email: 'invalid-email',
      name: '',
      role: 'INVALID_ROLE' as any,
      status: 'ACTIVE' as const,
    }

    const result = await createUser(invalidUserData)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(Array.isArray(result.error)).toBe(true)
    }
  })

  it('should handle Prisma unique constraint error', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        }
      )
    )

    const result = await createUser(validUserData)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('A user with this email already exists')
    }
  })

  it('should handle generic Prisma errors', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Database error',
        {
          code: 'P2014', // Different error code to test default case
          clientVersion: '5.0.0',
        }
      )
    )

    const result = await createUser(validUserData)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Database error occurred')
    }
  })

  it('should handle unexpected errors', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockRejectedValue(new Error('Unexpected error'))

    const result = await createUser(validUserData)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Failed to create user')
    }
  })

  it('should validate required fields', async () => {
    const incompleteData = {
      email: 'test@example.com',
      // Missing name, role, status
    } as any

    const result = await createUser(incompleteData)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(Array.isArray(result.error)).toBe(true)
    }
  })
})