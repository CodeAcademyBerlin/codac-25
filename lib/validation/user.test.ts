import { describe, it, expect } from 'vitest';

import {
  userSchema,
  createUserSchema,
  updateUserSchema,
  getUsersSchema,
  changeUserRoleSchema,
  bulkDeleteUsersSchema,
} from './user';

describe('User Validation Schemas', () => {
  describe('userSchema', () => {
    it('should validate a complete valid user object', () => {
      const validUser = {
        email: 'test@example.com',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Software developer with 5 years experience',
        role: 'STUDENT' as const,
        status: 'ACTIVE' as const,
        cohort: 'Cohort 2024',
        graduationDate: new Date('2024-12-01'),
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        githubUrl: 'https://github.com/johndoe',
        portfolioUrl: 'https://johndoe.dev',
        currentJob: 'Frontend Developer',
        currentCompany: 'Tech Corp',
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should validate with minimal required fields', () => {
      const minimalUser = {
        email: 'test@example.com',
      };

      const result = userSchema.safeParse(minimalUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('STUDENT');
        expect(result.data.status).toBe('ACTIVE');
      }
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = ['invalid-email', '@example.com', 'test@', ''];

      invalidEmails.forEach(email => {
        const result = userSchema.safeParse({ email });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.issues.some(err => err.path.includes('email'))
          ).toBe(true);
        }
      });
    });

    it('should validate avatar URLs and base64 data URIs', () => {
      const validAvatars = [
        'https://example.com/avatar.jpg',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...',
        undefined,
      ];

      validAvatars.forEach(avatar => {
        const result = userSchema.safeParse({
          email: 'test@example.com',
          avatar,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid avatar formats', () => {
      const invalidAvatars = [
        'not-a-url',
        'data:text/plain;base64,invalid',
        'invalid-format',
      ];

      invalidAvatars.forEach(avatar => {
        const result = userSchema.safeParse({
          email: 'test@example.com',
          role: 'STUDENT',
          status: 'ACTIVE',
          avatar,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should validate all role enums', () => {
      const validRoles = ['STUDENT', 'ALUMNI', 'MENTOR', 'ADMIN'] as const;

      validRoles.forEach(role => {
        const result = userSchema.safeParse({
          email: 'test@example.com',
          role,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should validate all status enums', () => {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'GRADUATED'] as const;

      validStatuses.forEach(status => {
        const result = userSchema.safeParse({
          email: 'test@example.com',
          status,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should validate URL fields with empty string fallback', () => {
      const urlFields = ['linkedinUrl', 'githubUrl', 'portfolioUrl'] as const;

      urlFields.forEach(field => {
        // Valid URLs should pass
        const validResult = userSchema.safeParse({
          email: 'test@example.com',
          [field]: 'https://example.com',
        });
        expect(validResult.success).toBe(true);

        // Empty strings should pass
        const emptyResult = userSchema.safeParse({
          email: 'test@example.com',
          [field]: '',
        });
        expect(emptyResult.success).toBe(true);

        // Invalid URLs should fail
        const invalidResult = userSchema.safeParse({
          email: 'test@example.com',
          [field]: 'not-a-url',
        });
        expect(invalidResult.success).toBe(false);
      });
    });

    it('should enforce string length limits', () => {
      const longString = 'a'.repeat(600);

      const fieldLimits = [
        { field: 'email', limit: 255 },
        { field: 'name', limit: 100 },
        { field: 'bio', limit: 500 },
        { field: 'cohort', limit: 100 },
        { field: 'currentJob', limit: 100 },
        { field: 'currentCompany', limit: 100 },
      ];

      fieldLimits.forEach(({ field }) => {
        const result = userSchema.safeParse({
          email:
            field === 'email'
              ? `${longString}@example.com`
              : 'test@example.com',
          [field]: field === 'email' ? `${longString}@example.com` : longString,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.issues.some(
              err =>
                err.path.includes(field) && err.message.includes('too long')
            )
          ).toBe(true);
        }
      });
    });
  });

  describe('createUserSchema', () => {
    it('should require email, role, and status', () => {
      const validData = {
        email: 'test@example.com',
        role: 'STUDENT' as const,
        status: 'ACTIVE' as const,
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const incompleteData = { email: 'test@example.com' };

      const result = createUserSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(err => err.path.includes('role'))).toBe(
          true
        );
        expect(
          result.error.issues.some(err => err.path.includes('status'))
        ).toBe(true);
      }
    });
  });

  describe('updateUserSchema', () => {
    it('should require valid CUID for id', () => {
      const validData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        email: 'updated@example.com',
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid CUID format', () => {
      const invalidData = {
        id: 'invalid-id',
        email: 'test@example.com',
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow partial updates', () => {
      const partialData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        name: 'Updated Name',
      };

      const result = updateUserSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });
  });

  describe('getUsersSchema', () => {
    it('should validate with default values', () => {
      const result = getUsersSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it('should validate filtering parameters', () => {
      const validData = {
        role: 'STUDENT' as const,
        status: 'ACTIVE' as const,
        cohort: '2024',
        limit: 50,
        offset: 100,
        search: 'john',
      };

      const result = getUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should enforce limit boundaries', () => {
      const tooLow = getUsersSchema.safeParse({ limit: 0 });
      expect(tooLow.success).toBe(false);

      const tooHigh = getUsersSchema.safeParse({ limit: 101 });
      expect(tooHigh.success).toBe(false);

      const valid = getUsersSchema.safeParse({ limit: 50 });
      expect(valid.success).toBe(true);
    });
  });

  describe('changeUserRoleSchema', () => {
    it('should validate role changes', () => {
      const validData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        role: 'ADMIN' as const,
      };

      const result = changeUserRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid roles', () => {
      const invalidData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        role: 'INVALID_ROLE',
      };

      const result = changeUserRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('bulkDeleteUsersSchema', () => {
    it('should validate array of CUIDs', () => {
      const validData = {
        ids: ['clh1x2y3z4w5v6u7t8s9r0q1p', 'clh2x3y4z5w6v7u8t9s0r1q2p'],
      };

      const result = bulkDeleteUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require at least one ID', () => {
      const emptyData = { ids: [] };

      const result = bulkDeleteUsersSchema.safeParse(emptyData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid CUID formats in array', () => {
      const invalidData = {
        ids: ['clh1x2y3z4w5v6u7t8s9r0q1p', 'invalid-id'],
      };

      const result = bulkDeleteUsersSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
