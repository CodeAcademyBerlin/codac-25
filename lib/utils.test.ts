import { describe, it, expect } from 'vitest'

import { cn } from './utils'

describe('CN Utility Function', () => {
  it('should merge classes correctly', () => {
    expect(cn('px-2 py-1', 'text-sm')).toBe('px-2 py-1 text-sm')
  })

  it('should override conflicting classes', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle conditional classes', () => {
    expect(cn('px-2', true && 'py-1')).toBe('px-2 py-1')
    expect(cn('px-2', false && 'py-1')).toBe('px-2')
  })

  it('should handle undefined and null values', () => {
    expect(cn('px-2', null, undefined, 'py-1')).toBe('px-2 py-1')
  })

  it('should handle empty input', () => {
    expect(cn()).toBe('')
  })

  it('should handle array of classes', () => {
    expect(cn(['px-2', 'py-1'], 'text-sm')).toBe('px-2 py-1 text-sm')
  })

  it('should handle object with conditional classes', () => {
    expect(cn({
      'px-2': true,
      'py-1': false,
      'text-sm': true
    })).toBe('px-2 text-sm')
  })
})