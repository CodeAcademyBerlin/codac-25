import { PrismaClient } from '@prisma/client'

import { vi } from 'vitest'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'
import type { DatabaseConnection } from '@/lib/db'

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>()

// Type-safe mock that matches our database connection type
export const mockPrisma = prismaMock as DeepMockProxy<DatabaseConnection>

// Reset function for use in beforeEach hooks
export const resetPrismaMock = () => mockReset(prismaMock)

// Mock the prisma client module
vi.mock('@/lib/db/prisma', () => ({
    prisma: prismaMock
}))

vi.mock('@/lib/db', () => ({
    prisma: prismaMock
}))

// Export types for test use
export type MockPrisma = typeof mockPrisma
export type PrismaMockType = DeepMockProxy<PrismaClient>
