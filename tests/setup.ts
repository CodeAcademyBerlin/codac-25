import '@testing-library/jest-dom'

// Mock Next.js router
import { vi } from 'vitest'

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

// Mock Prisma client
vi.mock('@/lib/db/prisma', () => ({
  prisma: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: vi.fn(),
}))