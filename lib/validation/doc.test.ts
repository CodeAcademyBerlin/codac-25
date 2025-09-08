import { describe, it, expect } from 'vitest'

import { 
  docSchema,
  createDocSchema,
  updateDocSchema,
  deleteDocSchema,
  bulkDeleteDocSchema,
  moveDocSchema
} from './doc'

describe('Document Validation Schemas', () => {
  describe('docSchema', () => {
    it('should validate a complete valid document object', () => {
      const validDoc = {
        title: 'My Document',
        content: [{ type: 'p', children: [{ text: 'Hello world' }] }],
        parentId: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        isFolder: false,
        isPublished: true,
        isArchived: false,
        coverImage: 'https://example.com/cover.jpg',
        icon: '📄',
        type: 'GENERAL' as const
      }

      const result = docSchema.safeParse(validDoc)
      expect(result.success).toBe(true)
    })

    it('should validate with minimal required fields', () => {
      const minimalDoc = {
        title: 'Minimal Document'
      }

      const result = docSchema.safeParse(minimalDoc)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isFolder).toBe(false)
        expect(result.data.isPublished).toBe(false)
        expect(result.data.isArchived).toBe(false)
        expect(result.data.type).toBe('GENERAL')
      }
    })

    it('should require non-empty title', () => {
      const emptyTitleDoc = { title: '' }

      const result = docSchema.safeParse(emptyTitleDoc)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some(err => 
          err.path.includes('title') && err.message.includes('required')
        )).toBe(true)
      }
    })

    it('should enforce title length limit', () => {
      const longTitle = 'a'.repeat(256)
      const longTitleDoc = { title: longTitle }

      const result = docSchema.safeParse(longTitleDoc)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some(err => 
          err.path.includes('title') && err.message.includes('too long')
        )).toBe(true)
      }
    })

    it('should validate all document type enums', () => {
      const validTypes = ['GENERAL', 'COURSE_MATERIAL', 'ASSIGNMENT', 'RESOURCE'] as const

      validTypes.forEach(type => {
        const result = docSchema.safeParse({ 
          title: 'Test Doc',
          type 
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid document types', () => {
      const invalidTypeDoc = { 
        title: 'Test Doc',
        type: 'INVALID_TYPE'
      }

      const result = docSchema.safeParse(invalidTypeDoc)
      expect(result.success).toBe(false)
    })

    it('should validate parentId as CUID when provided', () => {
      const validParentId = 'clh1x2y3z4w5v6u7t8s9r0q1p'
      const docWithParent = {
        title: 'Child Document',
        parentId: validParentId
      }

      const result = docSchema.safeParse(docWithParent)
      expect(result.success).toBe(true)
    })

    it('should reject invalid parentId format', () => {
      const invalidParentDoc = {
        title: 'Child Document',
        parentId: 'invalid-parent-id'
      }

      const result = docSchema.safeParse(invalidParentDoc)
      expect(result.success).toBe(false)
    })

    it('should validate coverImage as URL when provided', () => {
      const validCoverImages = [
        'https://example.com/image.jpg',
        'https://cdn.example.com/covers/doc-1.png',
        undefined
      ]

      validCoverImages.forEach(coverImage => {
        const result = docSchema.safeParse({ 
          title: 'Test Doc',
          coverImage
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid coverImage URLs', () => {
      const invalidCoverDoc = {
        title: 'Test Doc',
        coverImage: 'not-a-url'
      }

      const result = docSchema.safeParse(invalidCoverDoc)
      expect(result.success).toBe(false)
    })

    it('should validate boolean fields', () => {
      const booleanTests = [
        { isFolder: true },
        { isPublished: true },
        { isArchived: true },
        { isFolder: false, isPublished: false, isArchived: false }
      ]

      booleanTests.forEach(fields => {
        const result = docSchema.safeParse({ 
          title: 'Test Doc',
          ...fields
        })
        expect(result.success).toBe(true)
      })
    })

    it('should allow any content type', () => {
      const contentTypes = [
        [{ type: 'p', children: [{ text: 'Paragraph' }] }],
        { custom: 'content', data: [1, 2, 3] },
        'Simple string content',
        null,
        undefined
      ]

      contentTypes.forEach(content => {
        const result = docSchema.safeParse({ 
          title: 'Test Doc',
          content
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('createDocSchema', () => {
    it('should validate document creation with required fields', () => {
      const createData = {
        title: 'New Document',
        type: 'GENERAL' as const
      }

      const result = createDocSchema.safeParse(createData)
      expect(result.success).toBe(true)
    })

    it('should require title and type fields', () => {
      const incompleteData = { title: 'Test' }

      const result = createDocSchema.safeParse(incompleteData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some(err => err.path.includes('type'))).toBe(true)
      }
    })

    it('should handle empty string parentId', () => {
      const dataWithEmptyParent = {
        title: 'Root Document',
        type: 'GENERAL' as const,
        parentId: ''
      }

      const result = createDocSchema.safeParse(dataWithEmptyParent)
      expect(result.success).toBe(true)
      if (result.success) {
        // Empty string is valid for parentId (means no parent)
        expect(result.data.parentId).toBe('')
      }
    })

    it('should transform isFolder default value', () => {
      const docData = {
        title: 'Test Document',
        type: 'GENERAL' as const
      }

      const result = createDocSchema.safeParse(docData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isFolder).toBe(false)
      }
    })

    it('should accept valid parentId CUID', () => {
      const docWithParent = {
        title: 'Child Document',
        type: 'COURSE_MATERIAL' as const,
        parentId: 'clh1x2y3z4w5v6u7t8s9r0q1p'
      }

      const result = createDocSchema.safeParse(docWithParent)
      expect(result.success).toBe(true)
    })
  })

  describe('updateDocSchema', () => {
    it('should require valid CUID for id', () => {
      const updateData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        title: 'Updated Title'
      }

      const result = updateDocSchema.safeParse(updateData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid CUID format', () => {
      const invalidData = {
        id: 'invalid-id',
        title: 'Updated Title'
      }

      const result = updateDocSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some(err => 
          err.path.includes('id') && err.message.includes('Invalid document ID')
        )).toBe(true)
      }
    })

    it('should allow partial updates', () => {
      const partialUpdates = [
        { id: 'clh1x2y3z4w5v6u7t8s9r0q1p', title: 'New Title' },
        { id: 'clh1x2y3z4w5v6u7t8s9r0q1p', isPublished: true },
        { id: 'clh1x2y3z4w5v6u7t8s9r0q1p', type: 'ASSIGNMENT' as const },
        { id: 'clh1x2y3z4w5v6u7t8s9r0q1p', coverImage: 'https://example.com/new.jpg' }
      ]

      partialUpdates.forEach(data => {
        const result = updateDocSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('deleteDocSchema', () => {
    it('should validate document deletion with valid CUID', () => {
      const deleteData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p'
      }

      const result = deleteDocSchema.safeParse(deleteData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid CUID format', () => {
      const invalidData = {
        id: 'not-a-valid-cuid'
      }

      const result = deleteDocSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('bulkDeleteDocSchema', () => {
    it('should validate array of valid CUIDs', () => {
      const bulkData = {
        ids: [
          'clh1x2y3z4w5v6u7t8s9r0q1p',
          'clh2x3y4z5w6v7u8t9s0r1q2p',
          'clh3x4y5z6w7v8u9t0s1r2q3p'
        ]
      }

      const result = bulkDeleteDocSchema.safeParse(bulkData)
      expect(result.success).toBe(true)
    })

    it('should require at least one ID', () => {
      const emptyData = { ids: [] }

      const result = bulkDeleteDocSchema.safeParse(emptyData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some(err => 
          err.message.includes('At least one document ID is required')
        )).toBe(true)
      }
    })

    it('should reject array with invalid CUID formats', () => {
      const invalidData = {
        ids: ['clh1x2y3z4w5v6u7t8s9r0q1p', 'invalid-id']
      }

      const result = bulkDeleteDocSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('moveDocSchema', () => {
    it('should validate document move with valid IDs', () => {
      const moveData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        newParentId: 'clh2x3y4z5w6v7u8t9s0r1q2p'
      }

      const result = moveDocSchema.safeParse(moveData)
      expect(result.success).toBe(true)
    })

    it('should allow moving to root (no parent)', () => {
      const moveToRootData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p'
      }

      const result = moveDocSchema.safeParse(moveToRootData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid document ID', () => {
      const invalidData = {
        id: 'invalid-doc-id',
        newParentId: 'clh2x3y4z5w6v7u8t9s0r1q2p'
      }

      const result = moveDocSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid parent ID when provided', () => {
      const invalidParentData = {
        id: 'clh1x2y3z4w5v6u7t8s9r0q1p',
        newParentId: 'invalid-parent-id'
      }

      const result = moveDocSchema.safeParse(invalidParentData)
      expect(result.success).toBe(false)
    })
  })
})