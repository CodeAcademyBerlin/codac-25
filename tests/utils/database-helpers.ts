import type { User } from '@prisma/client'
import { vi } from 'vitest'

import { createMockUser } from './fixtures'
import { mockPrisma } from './prisma-mock'

/**
 * Database helpers for mocking Prisma operations in tests
 */
export class DatabaseHelpers {
  /**
   * Reset all Prisma mocks before each test
   */
  static resetMocks() {
    vi.clearAllMocks()
    mockPrisma.user.create.mockReset()
    mockPrisma.user.findUnique.mockReset()
    mockPrisma.user.findMany.mockReset()
    mockPrisma.user.update.mockReset()
    mockPrisma.user.delete.mockReset()
  }

  /**
   * Mock user database operations
   */
  static mockUserOperations() {
    return {
      mockCreateUser(userData: Partial<User> = {}) {
        const user = createMockUser(userData)
        mockPrisma.user.create.mockResolvedValue(user)
        return user
      },

      mockFindUserById(userId: string, userData: Partial<User> = {}) {
        const user = createMockUser({ id: userId, ...userData })
        mockPrisma.user.findUnique.mockResolvedValue(user)
        return user
      },

      mockFindUserByEmail(email: string, userData: Partial<User> = {}) {
        const user = createMockUser({ email, ...userData })
        mockPrisma.user.findUnique.mockResolvedValue(user)
        return user
      },

      mockUserNotFound() {
        mockPrisma.user.findUnique.mockResolvedValue(null)
        mockPrisma.user.findFirst.mockResolvedValue(null)
      },

      mockUpdateUser(userId: string, updatedData: Partial<User> = {}) {
        const user = createMockUser({ id: userId, ...updatedData })
        mockPrisma.user.update.mockResolvedValue(user)
        return user
      },

      mockDeleteUser(userId: string) {
        const user = createMockUser({ id: userId })
        mockPrisma.user.delete.mockResolvedValue(user)
        return user
      },

      mockFindManyUsers(users: User[] = []) {
        mockPrisma.user.findMany.mockResolvedValue(users)
        return users
      },

      mockUserError(operation: 'create' | 'findUnique' | 'update' | 'delete' | 'findMany', error = new Error('Database error')) {
        mockPrisma.user[operation].mockRejectedValue(error)
      }
    }
  }

  /**
   * Set up common database mocks for tests
   */
  static setupCommonMocks() {
    mockPrisma.$connect.mockResolvedValue()
    mockPrisma.$disconnect.mockResolvedValue()
    mockPrisma.$executeRaw.mockResolvedValue(1)
    mockPrisma.$queryRaw.mockResolvedValue([])
  }
}