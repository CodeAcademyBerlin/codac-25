import type {
  User,
  UserRole,
  UserStatus,
  Document,
  DocumentType,
  Job,
  JobType,
  JobLevel,
  Duck,
  Cohort
} from '@prisma/client'

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
  location: null,
  expertise: null,
  yearsExp: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  emailVerified: null,
  image: null,
  password: null
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
  location: null,
  expertise: null,
  yearsExp: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z')
}

// Mock Document
export const mockDocument: Document = {
  id: 'doc-123',
  title: 'Test Document',
  content: { type: 'doc', content: [] },
  parentId: null,
  isFolder: false,
  isPublished: false,
  isArchived: false,
  coverImage: null,
  icon: null,
  type: 'GENERAL' as DocumentType,
  authorId: 'user-123',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z')
}

// Mock Job
export const mockJob: Job = {
  id: 'job-123',
  title: 'Frontend Developer',
  description: 'Looking for a talented frontend developer',
  company: 'Tech Corp',
  location: 'Remote',
  type: 'FULL_TIME' as JobType,
  level: 'MID' as JobLevel,
  salary: '$60,000 - $80,000',
  remote: true,
  skills: ['React', 'TypeScript', 'Next.js'],
  benefits: ['Health Insurance', 'Remote Work'],
  applyUrl: 'https://example.com/apply',
  applyEmail: null,
  isActive: true,
  featured: false,
  expiresAt: null,
  postedById: 'user-123',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z')
}

// Mock Duck
export const mockDuck: Duck = {
  id: 'duck-123',
  title: 'Rubber Duck',
  imageUrl: 'https://example.com/duck.jpg',
  userId: 'user-123',
  createdAt: new Date('2024-01-01T00:00:00.000Z')
}

// Mock Cohort
export const mockCohort: Cohort = {
  id: 'cohort-123',
  name: 'Fall 2024 Cohort',
  startDate: new Date('2024-09-01T00:00:00.000Z'),
  description: 'A comprehensive web development bootcamp',
  image: null,
  avatar: null,
  slug: 'fall-2024',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z')
}

// Factory functions for creating test data
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    ...mockUser,
    ...overrides,
    id: overrides.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

export function createMockDocument(overrides: Partial<Document> = {}): Document {
  return {
    ...mockDocument,
    ...overrides,
    id: overrides.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

export function createMockJob(overrides: Partial<Job> = {}): Job {
  return {
    ...mockJob,
    ...overrides,
    id: overrides.id || `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

export function createMockDuck(overrides: Partial<Duck> = {}): Duck {
  return {
    ...mockDuck,
    ...overrides,
    id: overrides.id || `duck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

export function createMockCohort(overrides: Partial<Cohort> = {}): Cohort {
  return {
    ...mockCohort,
    ...overrides,
    id: overrides.id || `cohort-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}