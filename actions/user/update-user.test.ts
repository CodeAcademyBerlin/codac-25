import { Prisma } from '@prisma/client'
import { describe, test, expect, beforeEach } from 'vitest'

import type { UserPrivate } from '@/lib/server-action-utils'
import type { UpdateUserInput } from '@/lib/validation/user'
import { DatabaseHelpers } from '@/tests/utils/database-helpers'
import { createMockUser } from '@/tests/utils/fixtures'
import { mockPrisma, resetPrismaMock } from '@/tests/utils/prisma-mock'

import { updateUser } from './update-user'

// Helper to create mock UserPrivate response
function createMockUserPrivate(overrides: Partial<UserPrivate> = {}): UserPrivate {
    return {
        id: 'clkj2o3k00000default2d1x3',
        name: 'Test User',
        email: 'test@example.com',
        avatar: null,
        bio: null,
        role: 'STUDENT',
        status: 'ACTIVE',
        cohort: null,
        graduationDate: null,
        linkedinUrl: null,
        githubUrl: null,
        portfolioUrl: null,
        currentJob: null,
        currentCompany: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        ...overrides
    }
}

describe('updateUser Integration Tests', () => {
    beforeEach(() => {
        resetPrismaMock()
        DatabaseHelpers.resetMocks()
        DatabaseHelpers.setupCommonMocks()
    })

    describe('Successful Updates', () => {
        test('should successfully update user profile with valid data', async () => {
            // Arrange
            const userId = 'clkj2o3k00000356hghf2d1x3'
            const existingUser = createMockUser({
                id: userId,
                email: 'old@example.com',
                name: 'Old Name'
            })

            const updateData: UpdateUserInput = {
                id: userId,
                name: 'Updated Name',
                bio: 'Updated bio',
                role: 'ALUMNI',
                currentJob: 'Senior Developer',
                currentCompany: 'Tech Corp'
            }

            const expectedUpdatedUser = createMockUserPrivate({
                id: userId,
                name: 'Updated Name',
                bio: 'Updated bio',
                role: 'ALUMNI',
                currentJob: 'Senior Developer',
                currentCompany: 'Tech Corp',
                updatedAt: new Date()
            })

            // Mock database operations
            mockPrisma.user.findUnique.mockResolvedValue(existingUser)
            mockPrisma.user.update.mockResolvedValue(expectedUpdatedUser as any)

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(expectedUpdatedUser)
            }
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    name: true,
                }
            })
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    name: 'Updated Name',
                    bio: 'Updated bio',
                    role: 'ALUMNI',
                    currentJob: 'Senior Developer',
                    currentCompany: 'Tech Corp'
                },
                select: expect.any(Object)
            })
        })

        test('should successfully update user with partial data', async () => {
            // Arrange
            const userId = 'clkj2o3k00000456hghf2d1x3'
            const existingUser = createMockUser({
                id: userId,
                name: 'Current Name',
                bio: 'Current bio'
            })

            const updateData: UpdateUserInput = {
                id: userId,
                bio: 'New bio only'
            }

            const expectedUpdatedUser = createMockUserPrivate({
                id: userId,
                bio: 'New bio only',
                updatedAt: new Date()
            })

            // Mock database operations
            mockPrisma.user.findUnique.mockResolvedValue(existingUser)
            mockPrisma.user.update.mockResolvedValue(expectedUpdatedUser as any)

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(expectedUpdatedUser)
            }
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { bio: 'New bio only' },
                select: expect.any(Object)
            })
        })

        test('should successfully update user email when no conflicts exist', async () => {
            // Arrange
            const userId = 'clkj2o3k00000789hghf2d1x3'
            const existingUser = createMockUser({
                id: userId,
                email: 'old@example.com'
            })

            const updateData: UpdateUserInput = {
                id: userId,
                email: 'new@example.com',
                name: 'Updated Name'
            }

            const expectedUpdatedUser = createMockUserPrivate({
                id: userId,
                email: 'new@example.com',
                name: 'Updated Name',
                updatedAt: new Date()
            })

            // Mock database operations
            mockPrisma.user.findUnique
                .mockResolvedValueOnce(existingUser) // Initial user lookup
                .mockResolvedValueOnce(null) // Email conflict check - no conflict
            mockPrisma.user.update.mockResolvedValue(expectedUpdatedUser as any)

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(expectedUpdatedUser)
            }
            expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2)
            expect(mockPrisma.user.findUnique).toHaveBeenNthCalledWith(2, {
                where: { email: 'new@example.com' },
                select: { id: true }
            })
        })

        test('should filter out undefined values from update data', async () => {
            // Arrange
            const userId = 'clkj2o3k00000filterghf2d1x3'
            const existingUser = createMockUser({ id: userId })

            const updateData: UpdateUserInput = {
                id: userId,
                name: 'Defined Name',
                bio: undefined,
                currentJob: undefined,
                linkedinUrl: 'https://linkedin.com/user'
            }

            const expectedUpdatedUser = createMockUserPrivate({
                id: userId,
                name: 'Defined Name',
                linkedinUrl: 'https://linkedin.com/user',
                updatedAt: new Date()
            })

            // Mock database operations
            mockPrisma.user.findUnique.mockResolvedValue(existingUser)
            mockPrisma.user.update.mockResolvedValue(expectedUpdatedUser as any)

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(true)
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    name: 'Defined Name',
                    linkedinUrl: 'https://linkedin.com/user'
                    // bio and currentJob should be filtered out because they're undefined
                },
                select: expect.any(Object)
            })
        })
    })

    describe('Error Handling', () => {
        test('should return error when user does not exist', async () => {
            // Arrange
            const updateData: UpdateUserInput = {
                id: 'clkj2o3k00000nonexistghf2d1x3',
                name: 'New Name'
            }

            // Mock user not found
            mockPrisma.user.findUnique.mockResolvedValue(null)

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe('User not found')
            }
            expect(mockPrisma.user.update).not.toHaveBeenCalled()
        })

        test('should return error when email already exists for different user', async () => {
            // Arrange
            const userId = 'clkj2o3k00000123hghf2d1x3'
            const existingUser = createMockUser({
                id: userId,
                email: 'current@example.com'
            })

            const conflictingUser = createMockUser({
                id: 'clkj2o3k00000different2d1x3',
                email: 'conflict@example.com'
            })

            const updateData: UpdateUserInput = {
                id: userId,
                email: 'conflict@example.com'
            }

            // Mock database operations
            mockPrisma.user.findUnique
                .mockResolvedValueOnce(existingUser) // Initial user lookup
                .mockResolvedValueOnce(conflictingUser) // Email conflict check

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe('A user with this email already exists')
            }
            expect(mockPrisma.user.update).not.toHaveBeenCalled()
        })

        test('should not conflict when user updates to same email', async () => {
            // Arrange
            const userId = 'clkj2o3k00000sameemail2d1x3'
            const existingUser = createMockUser({
                id: userId,
                email: 'same@example.com'
            })

            const updateData: UpdateUserInput = {
                id: userId,
                email: 'same@example.com', // Same as current email
                name: 'Updated Name'
            }

            const expectedUpdatedUser = createMockUserPrivate({
                id: userId,
                email: 'same@example.com',
                name: 'Updated Name',
                updatedAt: new Date()
            })

            // Mock database operations
            mockPrisma.user.findUnique.mockResolvedValue(existingUser)
            mockPrisma.user.update.mockResolvedValue(expectedUpdatedUser as any)

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(expectedUpdatedUser)
            }
            // Should not perform email conflict check since email didn't change
            expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1)
        })

        test('should handle validation errors', async () => {
            // Arrange
            const updateData: UpdateUserInput = {
                id: 'invalid-id-format', // Invalid CUID format
                email: 'invalid-email'    // Invalid email format
            }

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBeDefined()
                expect(Array.isArray(result.error)).toBe(true) // Zod validation errors
            }
            expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
        })

        test('should handle Prisma unique constraint error', async () => {
            // Arrange
            const userId = 'clkj2o3k00000prismaerrord1x3'
            const existingUser = createMockUser({ id: userId })

            const updateData: UpdateUserInput = {
                id: userId,
                email: 'unique@example.com'
            }

            // Mock database operations
            mockPrisma.user.findUnique
                .mockResolvedValueOnce(existingUser) // Initial user lookup
                .mockResolvedValueOnce(null) // Email conflict check passes

            const prismaError = new Prisma.PrismaClientKnownRequestError(
                'Unique constraint failed',
                { code: 'P2002', clientVersion: '5.0.0' }
            )
            mockPrisma.user.update.mockRejectedValue(prismaError)

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe('A user with this email already exists')
            }
        })

        test('should handle Prisma record not found error', async () => {
            // Arrange
            const userId = 'clkj2o3k00000notfoundd1x3'
            const existingUser = createMockUser({ id: userId })

            const updateData: UpdateUserInput = {
                id: userId,
                name: 'New Name'
            }

            // Mock database operations
            mockPrisma.user.findUnique.mockResolvedValue(existingUser)

            const prismaError = new Prisma.PrismaClientKnownRequestError(
                'Record not found',
                { code: 'P2025', clientVersion: '5.0.0' }
            )
            mockPrisma.user.update.mockRejectedValue(prismaError)

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe('User not found')
            }
        })

        test('should handle generic database errors', async () => {
            // Arrange
            const userId = 'clkj2o3k00000dberrorfd1x3'
            const existingUser = createMockUser({ id: userId })

            const updateData: UpdateUserInput = {
                id: userId,
                name: 'New Name'
            }

            // Mock database operations
            mockPrisma.user.findUnique.mockResolvedValue(existingUser)
            mockPrisma.user.update.mockRejectedValue(new Error('Database connection failed'))

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toBe('Failed to update user')
            }
        })
    })

    describe('Edge Cases', () => {
        test('should handle empty update data gracefully', async () => {
            // Arrange
            const userId = 'clkj2o3k00000emptyupdate1x3'
            const existingUser = createMockUser({ id: userId })

            const updateData: UpdateUserInput = {
                id: userId
                // No other fields to update
            }

            const expectedUpdatedUser = createMockUserPrivate({
                id: userId,
                updatedAt: new Date()
            })

            // Mock database operations
            mockPrisma.user.findUnique.mockResolvedValue(existingUser)
            mockPrisma.user.update.mockResolvedValue(expectedUpdatedUser as any)

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(true)
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {}, // Empty data object after filtering undefined values
                select: expect.any(Object)
            })
        })

        test('should handle avatar URL update', async () => {
            // Arrange
            const userId = 'clkj2o3k00000avatarupd1x3'
            const existingUser = createMockUser({ id: userId })

            const updateData: UpdateUserInput = {
                id: userId,
                avatar: 'https://example.com/new-avatar.jpg'
            }

            const expectedUpdatedUser = createMockUserPrivate({
                id: userId,
                avatar: 'https://example.com/new-avatar.jpg',
                updatedAt: new Date()
            })

            // Mock database operations
            mockPrisma.user.findUnique.mockResolvedValue(existingUser)
            mockPrisma.user.update.mockResolvedValue(expectedUpdatedUser as any)

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.avatar).toBe('https://example.com/new-avatar.jpg')
            }
        })

        test('should handle social media URL updates', async () => {
            // Arrange
            const userId = 'clkj2o3k00000socialupd1x3'
            const existingUser = createMockUser({ id: userId })

            const updateData: UpdateUserInput = {
                id: userId,
                linkedinUrl: 'https://linkedin.com/in/testuser',
                githubUrl: 'https://github.com/testuser',
                portfolioUrl: 'https://testuser.dev'
            }

            const expectedUpdatedUser = createMockUserPrivate({
                id: userId,
                linkedinUrl: 'https://linkedin.com/in/testuser',
                githubUrl: 'https://github.com/testuser',
                portfolioUrl: 'https://testuser.dev',
                updatedAt: new Date()
            })

            // Mock database operations
            mockPrisma.user.findUnique.mockResolvedValue(existingUser)
            mockPrisma.user.update.mockResolvedValue(expectedUpdatedUser as any)

            // Act
            const result = await updateUser(updateData)

            // Assert
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.linkedinUrl).toBe('https://linkedin.com/in/testuser')
                expect(result.data.githubUrl).toBe('https://github.com/testuser')
                expect(result.data.portfolioUrl).toBe('https://testuser.dev')
            }
        })
    })
})
