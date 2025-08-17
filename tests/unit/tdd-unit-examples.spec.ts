/**
 * TDD Unit Test Examples for Beginners
 * 
 * This file demonstrates Test-Driven Development at the unit level.
 * These tests would be written BEFORE implementing the actual functions.
 * 
 * Note: This uses a basic testing approach. In a real project, you might use
 * Jest, Vitest, or another unit testing framework.
 */

// Mock utility functions that we would implement after writing these tests
type User = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};

type Document = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  isPublished: boolean;
};

// TDD Example 1: Email validation function
describe('Email Validation (TDD Example)', () => {
  // Step 1: Write failing tests first
  test('should return true for valid email addresses', () => {
    // This test will fail initially because validateEmail doesn't exist yet
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
    expect(validateEmail('user123@subdomain.example.com')).toBe(true);
  });

  test('should return false for invalid email addresses', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user.domain.com')).toBe(false);
  });

  test('should handle edge cases', () => {
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
    expect(validateEmail('   ')).toBe(false);
  });
});

// Step 2: Implement minimal function to make tests pass
function validateEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// TDD Example 2: User creation function
describe('User Creation (TDD Example)', () => {
  test('should create user with valid data', () => {
    const userData = {
      email: 'user@example.com',
      name: 'John Doe'
    };
    
    const user = createUser(userData);
    
    expect(user.email).toBe('user@example.com');
    expect(user.name).toBe('John Doe');
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  test('should throw error for invalid email', () => {
    const userData = {
      email: 'invalid-email',
      name: 'John Doe'
    };
    
    expect(() => createUser(userData)).toThrow('Invalid email address');
  });

  test('should throw error for empty name', () => {
    const userData = {
      email: 'user@example.com',
      name: ''
    };
    
    expect(() => createUser(userData)).toThrow('Name is required');
  });

  test('should trim whitespace from name', () => {
    const userData = {
      email: 'user@example.com',
      name: '  John Doe  '
    };
    
    const user = createUser(userData);
    expect(user.name).toBe('John Doe');
  });
});

// Step 2: Implement function to make tests pass
function createUser(userData: { email: string; name: string }): User {
  if (!validateEmail(userData.email)) {
    throw new Error('Invalid email address');
  }
  
  const trimmedName = userData.name.trim();
  if (!trimmedName) {
    throw new Error('Name is required');
  }
  
  return {
    id: Math.random().toString(36).substr(2, 9), // Simple ID generation
    email: userData.email,
    name: trimmedName,
    createdAt: new Date()
  };
}

// TDD Example 3: Document slug generation
describe('Document Slug Generation (TDD Example)', () => {
  test('should convert title to URL-friendly slug', () => {
    expect(generateSlug('My Great Article')).toBe('my-great-article');
    expect(generateSlug('JavaScript Tips & Tricks')).toBe('javascript-tips-tricks');
    expect(generateSlug('How to Use TypeScript?')).toBe('how-to-use-typescript');
  });

  test('should handle special characters', () => {
    expect(generateSlug('C++ Programming')).toBe('c-programming');
    expect(generateSlug('Node.js & React')).toBe('node-js-react');
    expect(generateSlug('@mentions #hashtags')).toBe('mentions-hashtags');
  });

  test('should handle multiple spaces and trim', () => {
    expect(generateSlug('  Multiple    Spaces  ')).toBe('multiple-spaces');
    expect(generateSlug('Too-----many---dashes')).toBe('too-many-dashes');
  });

  test('should handle empty or invalid input', () => {
    expect(generateSlug('')).toBe('untitled');
    expect(generateSlug('   ')).toBe('untitled');
    expect(generateSlug('!!!')).toBe('untitled');
  });

  test('should limit slug length', () => {
    const longTitle = 'This is a very long title that should be truncated at some point to prevent extremely long URLs';
    const slug = generateSlug(longTitle);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug).not.toMatch(/-$/); // Should not end with dash
  });
});

// Implementation after writing tests
function generateSlug(title: string): string {
  if (!title || typeof title !== 'string') {
    return 'untitled';
  }
  
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  
  if (!slug) {
    return 'untitled';
  }
  
  // Limit length and ensure it doesn't end with dash
  if (slug.length > 60) {
    slug = slug.substring(0, 60).replace(/-+$/, '');
  }
  
  return slug || 'untitled';
}

// TDD Example 4: Document word count
describe('Document Word Count (TDD Example)', () => {
  test('should count words in simple text', () => {
    expect(countWords('Hello world')).toBe(2);
    expect(countWords('The quick brown fox')).toBe(4);
  });

  test('should handle empty or whitespace-only content', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords('\n\t')).toBe(0);
  });

  test('should handle multiple spaces and line breaks', () => {
    expect(countWords('Hello    world\n\nTest')).toBe(3);
    expect(countWords('Word1\tWord2\nWord3')).toBe(3);
  });

  test('should ignore HTML tags', () => {
    expect(countWords('<p>Hello <strong>world</strong></p>')).toBe(2);
    expect(countWords('<h1>Title</h1><p>Content here</p>')).toBe(3);
  });

  test('should handle special characters and punctuation', () => {
    expect(countWords("Don't count punctuation!")).toBe(3);
    expect(countWords('Email@example.com counts as one word')).toBe(6);
  });
});

// Implementation
function countWords(content: string): number {
  if (!content || typeof content !== 'string') {
    return 0;
  }
  
  // Remove HTML tags
  const textOnly = content.replace(/<[^>]*>/g, ' ');
  
  // Split by whitespace and filter out empty strings
  const words = textOnly
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  return words.length;
}

// TDD Example 5: Reading time calculator
describe('Reading Time Calculator (TDD Example)', () => {
  test('should calculate reading time for average text', () => {
    const wordsPerMinute = 200;
    expect(calculateReadingTime(200)).toBe(1); // 200 words = 1 minute
    expect(calculateReadingTime(400)).toBe(2); // 400 words = 2 minutes
    expect(calculateReadingTime(100)).toBe(1); // Always at least 1 minute
  });

  test('should round up partial minutes', () => {
    expect(calculateReadingTime(250)).toBe(2); // 1.25 minutes -> 2 minutes
    expect(calculateReadingTime(350)).toBe(2); // 1.75 minutes -> 2 minutes
  });

  test('should handle edge cases', () => {
    expect(calculateReadingTime(0)).toBe(1);
    expect(calculateReadingTime(-10)).toBe(1);
    expect(calculateReadingTime(50)).toBe(1); // Less than 1 minute still shows 1
  });

  test('should handle very long documents', () => {
    expect(calculateReadingTime(2000)).toBe(10); // 2000 words = 10 minutes
    expect(calculateReadingTime(5500)).toBe(28); // 27.5 minutes -> 28 minutes
  });
});

// Implementation
function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200; // Average reading speed
  
  if (wordCount <= 0) {
    return 1; // Minimum 1 minute
  }
  
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // Always at least 1 minute
}

/**
 * TDD Principles Demonstrated in These Examples:
 * 
 * 1. RED Phase: Write failing tests first
 *    - All the test functions above would fail initially
 *    - Tests define the expected behavior before implementation
 * 
 * 2. GREEN Phase: Write minimal code to make tests pass
 *    - Implementations are simple and focused on making tests pass
 *    - No over-engineering or unnecessary features
 * 
 * 3. REFACTOR Phase: Improve code while keeping tests green
 *    - Once tests pass, we can refactor with confidence
 *    - Tests act as a safety net during refactoring
 * 
 * Benefits of TDD:
 * - Better test coverage (close to 100%)
 * - Cleaner, more focused code
 * - Reduced bugs and regressions
 * - Better API design (tests force you to think about usage)
 * - Documentation through tests (tests show how to use the code)
 * - Confidence when refactoring or adding features
 * 
 * TDD Best Practices:
 * - Keep tests simple and focused
 * - Test behavior, not implementation
 * - Use descriptive test names
 * - Test edge cases and error conditions
 * - Keep the Red-Green-Refactor cycle short
 * - Refactor both code and tests
 */