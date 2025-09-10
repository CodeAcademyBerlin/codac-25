import { Prisma } from '@prisma/client'
import { describe, it, expect, beforeEach } from 'vitest'

import { createUser } from '@/actions/user/create-user'
import { DatabaseHelpers } from '@/tests/utils/database-helpers'
import { createMockUser } from '@/tests/utils/fixtures'
import { mockPrisma } from '@/tests/utils/prisma-mock'


describe('createUser Server Action', () => {
  const validUserData = {
    email: 'test@example.com',
    name: 'Test User',
    role: 'STUDENT' as const,
    status: 'ACTIVE' as const,
  }

  beforeEach(() => {
    DatabaseHelpers.resetMocks()
    DatabaseHelpers.setupCommonMocks()
  })

  it('should create a user successfully', async () => {
    // Set up mocks using database helpers
    const expectedUser = createMockUser(validUserData)
    const userHelpers = DatabaseHelpers.mockUserOperations()

    userHelpers.mockUserNotFound() // No existing user with this email
    userHelpers.mockCreateUser(expectedUser)

    const result = await createUser(validUserData)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(expect.objectContaining({
        email: expectedUser.email,
        name: expectedUser.name,
        role: expectedUser.role,
        status: expectedUser.status,
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
    const existingUser = createMockUser({ email: validUserData.email })
    const userHelpers = DatabaseHelpers.mockUserOperations()
    userHelpers.mockFindUserByEmail(validUserData.email, existingUser)

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
    const userHelpers = DatabaseHelpers.mockUserOperations()
    userHelpers.mockUserNotFound()

    // Mock unique constraint error
    const uniqueError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '5.0.0',
      }
    )
    userHelpers.mockUserError('create', uniqueError)

    const result = await createUser(validUserData)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('A user with this email already exists')
    }
  })

  it('should handle generic Prisma errors', async () => {
    const userHelpers = DatabaseHelpers.mockUserOperations()
    userHelpers.mockUserNotFound()

    // Mock generic Prisma error
    const genericError = new Prisma.PrismaClientKnownRequestError(
      'Database error',
      {
        code: 'P2014', // Different error code to test default case
        clientVersion: '5.0.0',
      }
    )
    userHelpers.mockUserError('create', genericError)

    const result = await createUser(validUserData)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Database error occurred')
    }
  })

  it('should handle unexpected errors', async () => {
    const userHelpers = DatabaseHelpers.mockUserOperations()
    userHelpers.mockUserNotFound()
    userHelpers.mockUserError('create', new Error('Unexpected error'))

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