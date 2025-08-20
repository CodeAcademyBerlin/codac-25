import { Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

/**
 * Database helpers for e2e testing
 * Provides utilities for test isolation and user management
 */

export interface TestUser {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role?: 'STUDENT' | 'ADMIN' | 'ALUMNI';
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  cohortId?: string | null;
}

export class DatabaseHelpers {
  private prisma: PrismaClient;

  constructor() {
    // Use test database connection
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
        }
      }
    });
  }

  async connect() {
    await this.prisma.$connect();
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  // === USER MANAGEMENT ===
  async createTestUser(userData: TestUser) {
    const bcrypt = await import('bcryptjs');
    
    const user = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: userData.password ? await bcrypt.hash(userData.password, 12) : null,
        role: userData.role || 'STUDENT',
        status: userData.status || 'ACTIVE',
        cohortId: userData.cohortId || null,
      },
    });

    return user;
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  async deleteTestUser(email: string) {
    try {
      await this.prisma.user.delete({
        where: { email: email.toLowerCase() }
      });
    } catch (error) {
      // User might not exist, which is fine for cleanup
      console.log(`User ${email} not found for deletion`);
    }
  }

  async deleteUserById(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      console.log(`User ${id} not found for deletion`);
    }
  }

  async updateUserStatus(email: string, status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED') {
    return await this.prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { status }
    });
  }

  // === TEST ISOLATION ===
  async cleanupTestUsers() {
    // Delete users created for testing (with test-specific email patterns)
    await this.prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: 'test@' } },
          { email: { contains: '@example.com' } },
          { email: { contains: 'playwright-' } },
          { name: { startsWith: 'Test User' } }
        ]
      }
    });
  }

  async cleanupAllTestData() {
    // Clean up in order due to foreign key constraints
    await this.prisma.session.deleteMany({
      where: {
        user: {
          OR: [
            { email: { contains: 'test@' } },
            { email: { contains: '@example.com' } },
            { email: { contains: 'playwright-' } }
          ]
        }
      }
    });

    await this.prisma.account.deleteMany({
      where: {
        user: {
          OR: [
            { email: { contains: 'test@' } },
            { email: { contains: '@example.com' } },
            { email: { contains: 'playwright-' } }
          ]
        }
      }
    });

    await this.cleanupTestUsers();
  }

  async resetAutoIncrements() {
    // Reset auto-increment counters if using MySQL/PostgreSQL
    try {
      await this.prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`;
    } catch {
      // Ignore errors for different database types
    }
  }

  // === SESSION MANAGEMENT ===
  async createUserSession(userId: string, expiresAt?: Date) {
    return await this.prisma.session.create({
      data: {
        userId,
        sessionToken: `test-session-${Date.now()}`,
        expires: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    });
  }

  async deleteUserSessions(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId }
    });
  }

  async getUserSessions(userId: string) {
    return await this.prisma.session.findMany({
      where: { userId }
    });
  }

  // === VERIFICATION TOKENS ===
  async createVerificationToken(email: string, token: string = `verify-${Date.now()}`) {
    return await this.prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });
  }

  async getVerificationToken(email: string) {
    return await this.prisma.verificationToken.findFirst({
      where: { identifier: email.toLowerCase() }
    });
  }

  async deleteVerificationTokens(email: string) {
    await this.prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() }
    });
  }

  // === OAUTH ACCOUNTS ===
  async createOAuthAccount(userId: string, provider: 'google' | 'github', providerAccountId: string) {
    return await this.prisma.account.create({
      data: {
        userId,
        type: 'oauth',
        provider,
        providerAccountId,
        access_token: `test-access-token-${Date.now()}`,
        token_type: 'Bearer',
      }
    });
  }

  async getUserAccounts(userId: string) {
    return await this.prisma.account.findMany({
      where: { userId }
    });
  }

  async deleteUserAccounts(userId: string) {
    await this.prisma.account.deleteMany({
      where: { userId }
    });
  }

  // === HEALTH CHECK ===
  async isConnected(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async getDatabaseInfo() {
    try {
      const userCount = await this.prisma.user.count();
      const sessionCount = await this.prisma.session.count();
      const accountCount = await this.prisma.account.count();
      
      return {
        userCount,
        sessionCount,
        accountCount,
        connected: true
      };
    } catch (error) {
      return {
        userCount: 0,
        sessionCount: 0,
        accountCount: 0,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Test data factory for creating realistic test data
 */
export class TestDataFactory {
  static generateUniqueEmail(prefix = 'test'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}@example.com`;
  }

  static generateUniqueName(prefix = 'Test User'): string {
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix} ${random}`;
  }

  static createValidUser(overrides: Partial<TestUser> = {}): TestUser {
    return {
      name: this.generateUniqueName(),
      email: this.generateUniqueEmail(),
      password: 'testpassword123',
      role: 'STUDENT',
      status: 'ACTIVE',
      ...overrides
    };
  }

  static createInvalidUsers() {
    return {
      noName: {
        name: '',
        email: this.generateUniqueEmail(),
        password: 'testpassword123'
      },
      invalidEmail: {
        name: this.generateUniqueName(),
        email: 'invalid-email',
        password: 'testpassword123'
      },
      shortPassword: {
        name: this.generateUniqueName(),
        email: this.generateUniqueEmail(),
        password: 'short'
      },
      noPassword: {
        name: this.generateUniqueName(),
        email: this.generateUniqueEmail(),
        password: ''
      }
    };
  }

  static createPasswordMismatchData() {
    return {
      name: this.generateUniqueName(),
      email: this.generateUniqueEmail(),
      password: 'password123',
      confirmPassword: 'different123'
    };
  }
}

/**
 * Integration helper that combines database operations with browser testing
 */
export class DatabaseTestIntegration {
  private db: DatabaseHelpers;
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.db = new DatabaseHelpers();
  }

  async setup() {
    await this.db.connect();
    return this.db;
  }

  async cleanup() {
    await this.db.cleanupAllTestData();
    await this.db.disconnect();
  }

  async createUserAndSignIn(userData: TestUser) {
    // Create user in database
    const user = await this.db.createTestUser(userData);
    
    // Sign in via UI
    if (userData.password) {
      await this.page.goto('/auth/signin');
      await this.page.waitForLoadState('networkidle');
      
      await this.page.locator('input[name="email"]').fill(userData.email);
      await this.page.locator('input[name="password"]').fill(userData.password);
      await this.page.locator('button[type="submit"]').click();
      
      await this.page.waitForTimeout(2000);
    }
    
    return user;
  }

  async verifyUserExistsInDatabase(email: string) {
    return await this.db.findUserByEmail(email);
  }

  async verifyUserSessionExists(userId: string) {
    const sessions = await this.db.getUserSessions(userId);
    return sessions.length > 0;
  }
}