import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { getBaseUrl } from './get-base-url'

// Store original values to restore after tests
const originalWindow = global.window
const originalProcess = global.process

describe('Get Base URL Function', () => {
  beforeEach(() => {
    // Reset environment before each test
    delete global.window
    global.process = {
      ...originalProcess,
      env: {}
    }
  })

  afterEach(() => {
    // Restore original values
    global.window = originalWindow
    global.process = originalProcess
  })

  describe('Browser environment', () => {
    it('should return window.location.origin when in browser', () => {
      global.window = {
        location: {
          origin: 'https://example.com'
        }
      } as any

      const result = getBaseUrl()
      expect(result).toBe('https://example.com')
    })

    it('should handle different browser origins', () => {
      const origins = [
        'https://app.example.com',
        'http://localhost:3000',
        'https://subdomain.domain.co.uk',
        'http://192.168.1.100:8080'
      ]

      origins.forEach(origin => {
        global.window = {
          location: { origin }
        } as any

        const result = getBaseUrl()
        expect(result).toBe(origin)
      })
    })
  })

  describe('Server environment - Vercel', () => {
    it('should return Vercel URL when VERCEL_URL is set', () => {
      global.process = {
        ...originalProcess,
        env: {
          VERCEL_URL: 'my-app-123.vercel.app'
        }
      }

      const result = getBaseUrl()
      expect(result).toBe('https://my-app-123.vercel.app')
    })

    it('should prioritize Vercel URL over other environment variables', () => {
      global.process = {
        ...originalProcess,
        env: {
          VERCEL_URL: 'vercel-app.vercel.app',
          NEXT_PUBLIC_APP_URL: 'https://should-not-be-used.com',
          PORT: '4000'
        }
      }

      const result = getBaseUrl()
      expect(result).toBe('https://vercel-app.vercel.app')
    })
  })

  describe('Server environment - Custom App URL', () => {
    it('should return NEXT_PUBLIC_APP_URL when set and no Vercel URL', () => {
      global.process = {
        ...originalProcess,
        env: {
          NEXT_PUBLIC_APP_URL: 'https://my-custom-domain.com'
        }
      }

      const result = getBaseUrl()
      expect(result).toBe('https://my-custom-domain.com')
    })

    it('should handle different custom app URLs', () => {
      const customUrls = [
        'https://api.example.com',
        'http://staging.myapp.com',
        'https://production-app.herokuapp.com'
      ]

      customUrls.forEach(url => {
        global.process = {
          ...originalProcess,
          env: {
            NEXT_PUBLIC_APP_URL: url
          }
        }

        const result = getBaseUrl()
        expect(result).toBe(url)
      })
    })
  })

  describe('Server environment - Development fallback', () => {
    it('should return localhost:3000 by default in development', () => {
      global.process = {
        ...originalProcess,
        env: {}
      }

      const result = getBaseUrl()
      expect(result).toBe('http://localhost:3000')
    })

    it('should use custom PORT when set', () => {
      global.process = {
        ...originalProcess,
        env: {
          PORT: '4000'
        }
      }

      const result = getBaseUrl()
      expect(result).toBe('http://localhost:4000')
    })

    it('should handle different port numbers', () => {
      const ports = ['3001', '8000', '8080', '5000']

      ports.forEach(port => {
        global.process = {
          ...originalProcess,
          env: {
            PORT: port
          }
        }

        const result = getBaseUrl()
        expect(result).toBe(`http://localhost:${port}`)
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty VERCEL_URL', () => {
      global.process = {
        ...originalProcess,
        env: {
          VERCEL_URL: '',
          NEXT_PUBLIC_APP_URL: 'https://fallback.com'
        }
      }

      const result = getBaseUrl()
      expect(result).toBe('https://fallback.com')
    })

    it('should handle empty NEXT_PUBLIC_APP_URL', () => {
      global.process = {
        ...originalProcess,
        env: {
          NEXT_PUBLIC_APP_URL: '',
          PORT: '4000'
        }
      }

      const result = getBaseUrl()
      expect(result).toBe('http://localhost:4000')
    })

    it('should handle undefined process.env', () => {
      global.process = {
        ...originalProcess,
        env: undefined as any
      }

      const result = getBaseUrl()
      expect(result).toBe('http://localhost:3000')
    })

    it('should handle string port numbers correctly', () => {
      global.process = {
        ...originalProcess,
        env: {
          PORT: '0' // Edge case: port 0
        }
      }

      const result = getBaseUrl()
      expect(result).toBe('http://localhost:0')
    })
  })

  describe('Environment precedence', () => {
    it('should follow correct precedence order', () => {
      // Browser environment should always win
      global.window = {
        location: { origin: 'https://browser.com' }
      } as any
      global.process = {
        ...originalProcess,
        env: {
          VERCEL_URL: 'vercel.app',
          NEXT_PUBLIC_APP_URL: 'https://custom.com',
          PORT: '4000'
        }
      }

      const result = getBaseUrl()
      expect(result).toBe('https://browser.com')
    })

    it('should fallback through server environment variables correctly', () => {
      // Test Vercel URL precedence
      global.process = {
        ...originalProcess,
        env: {
          VERCEL_URL: 'vercel-app.vercel.app',
          NEXT_PUBLIC_APP_URL: 'https://custom.com',
          PORT: '4000'
        }
      }

      expect(getBaseUrl()).toBe('https://vercel-app.vercel.app')

      // Test custom app URL fallback
      global.process = {
        ...originalProcess,
        env: {
          NEXT_PUBLIC_APP_URL: 'https://custom.com',
          PORT: '4000'
        }
      }

      expect(getBaseUrl()).toBe('https://custom.com')

      // Test development fallback
      global.process = {
        ...originalProcess,
        env: {
          PORT: '4000'
        }
      }

      expect(getBaseUrl()).toBe('http://localhost:4000')
    })
  })
})