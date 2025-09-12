import { describe, it, expect } from 'vitest'

import { updateProfileSchema } from './auth'

describe('Auth Validation Schemas', () => {
  describe('updateProfileSchema', () => {
    it('should validate profile updates with valid data', () => {
      const validData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        email: 'updated@example.com',
        name: 'John Smith',
        bio: 'Updated bio',
        avatar: 'https://example.com/new-avatar.jpg',
        linkedinUrl: 'https://linkedin.com/in/johnsmith',
        githubUrl: 'https://github.com/johnsmith',
        portfolioUrl: 'https://johnsmith.dev'
      }

      const result = updateProfileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require valid CUID for id', () => {
      const validData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        name: 'John Doe'
      }

      const result = updateProfileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid CUID format', () => {
      const invalidData = {
        id: 'invalid-id-format',
        name: 'John Doe'
      }

      const result = updateProfileSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some(err =>
          err.path.includes('id') && err.message.includes('Invalid user ID')
        )).toBe(true)
      }
    })

    it('should allow partial updates (all fields optional except id)', () => {
      const partialUpdates = [
        { id: 'clh1x2y3z4w5v6u7t8s9r0q1p', name: 'New Name' },
        { id: 'clh1x2y3z4w5v6u7t8s9r0q1p', email: 'new@example.com' },
        { id: 'clh1x2y3z4w5v6u7t8s9r0q1p', bio: 'New bio' },
        { id: 'clh1x2y3z4w5v6u7t8s9r0q1p', avatar: 'https://new-avatar.com/pic.jpg' }
      ]

      partialUpdates.forEach(data => {
        const result = updateProfileSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should exclude role and status fields (omitted from userSchema)', () => {
      const dataWithRestrictedFields = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        name: 'John Doe',
        role: 'ADMIN',
        status: 'INACTIVE'
      }

      const result = updateProfileSchema.safeParse(dataWithRestrictedFields)
      expect(result.success).toBe(true)

      // The schema should ignore role and status fields
      if (result.success) {
        expect('role' in result.data).toBe(false)
        expect('status' in result.data).toBe(false)
      }
    })

    it('should validate email format when provided', () => {
      const invalidEmailData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        email: 'invalid-email-format'
      }

      const result = updateProfileSchema.safeParse(invalidEmailData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some(err =>
          err.path.includes('email') && err.message.includes('Invalid email')
        )).toBe(true)
      }
    })

    it('should validate avatar format when provided', () => {
      const validAvatars = [
        'https://example.com/avatar.jpg',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ]

      validAvatars.forEach(avatar => {
        const data = {
          id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
          avatar
        }

        const result = updateProfileSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })



    it('should validate social URLs with empty string fallback', () => {
      const socialFields = [
        { field: 'linkedinUrl', url: 'https://linkedin.com/in/user' },
        { field: 'githubUrl', url: 'https://github.com/user' },
        { field: 'portfolioUrl', url: 'https://user.dev' }
      ]

      socialFields.forEach(({ field, url }) => {
        // Valid URL
        const validData = {
          id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
          [field]: url
        }
        expect(updateProfileSchema.safeParse(validData).success).toBe(true)

        // Empty string
        const emptyData = {
          id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
          [field]: ''
        }
        expect(updateProfileSchema.safeParse(emptyData).success).toBe(true)

        // Invalid URL
        const invalidData = {
          id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
          [field]: 'invalid-url'
        }
        expect(updateProfileSchema.safeParse(invalidData).success).toBe(false)
      })
    })

    it('should enforce field length limits', () => {
      const testCases = [
        { field: 'name', limit: 100, longValue: 'a'.repeat(101) },
        { field: 'bio', limit: 500, longValue: 'a'.repeat(501) },
        { field: 'email', limit: 255, longValue: `${'a'.repeat(250)}@example.com` },
        { field: 'currentJob', limit: 100, longValue: 'a'.repeat(101) }
      ]

      testCases.forEach(({ field, longValue }) => {
        const data = {
          id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
          [field]: longValue
        }

        const result = updateProfileSchema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors.some(err =>
            err.path.includes(field) && err.message.includes('too long')
          )).toBe(true)
        }
      })
    })

    it('should handle missing id field', () => {
      const dataWithoutId = {
        name: 'John Doe',
        email: 'john@example.com'
      }

      const result = updateProfileSchema.safeParse(dataWithoutId)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some(err => err.path.includes('id'))).toBe(true)
      }
    })
  })
})