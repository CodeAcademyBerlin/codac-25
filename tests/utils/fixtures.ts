import type { User, UserRole, UserStatus } from '@prisma/client'

// Test data fixtures
export const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  bio: null,
  role: 'STUDENT' as UserRole,
  status: 'ACTIVE' as UserStatus,
  cohortId: null,
  graduationDate: null,
  linkedinUrl: null,
  githubUrl: null,
  portfolioUrl: null,
  currentJob: null,
  currentCompany: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  emailVerified: null,
  image: null,
  password: null,
}

export const mockUserPrivate = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  avatar: null,
  bio: null,
  role: 'STUDENT' as UserRole,
  status: 'ACTIVE' as UserStatus,
  cohort: null,
  graduationDate: null,
  linkedinUrl: null,
  githubUrl: null,
  portfolioUrl: null,
  currentJob: null,
  currentCompany: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
}

// Factory function for creating test users
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    ...mockUser,
    ...overrides,
  }
}