import '@testing-library/jest-dom'

import { beforeEach, vi } from 'vitest'

import { DatabaseHelpers } from './utils/database-helpers'
import { resetPrismaMock } from './utils/prisma-mock'

// Reset mocks before each test
beforeEach(() => {
  resetPrismaMock()
  DatabaseHelpers.resetMocks()
  DatabaseHelpers.setupCommonMocks()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// Mock Auth.js
vi.mock('next-auth', () => ({
  default: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock logger to avoid console noise during tests
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
}))

// Mock server action utilities
vi.mock('@/lib/server-action-utils', async () => {
  const actual = await vi.importActual('@/lib/server-action-utils')
  return {
    ...actual,
    withAuth: vi.fn((handler) => handler),
    createServerActionError: vi.fn((message) => ({ success: false, error: message })),
    createServerActionSuccess: vi.fn((data) => ({ success: true, data })),
    handlePrismaError: vi.fn(() => 'Database error occurred'),
    handleValidationError: vi.fn(() => 'Validation failed'),
    createServerAction: vi.fn(),
    checkPermission: vi.fn(() => Promise.resolve(true)),
    commonSelects: {
      user: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      userPrivate: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        cohortId: true,
        graduationDate: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        currentJob: true,
        currentCompany: true,
        location: true,
        expertise: true,
        yearsExp: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  }
})

// Import the Prisma mock - this will automatically mock the Prisma client
import './utils/prisma-mock'