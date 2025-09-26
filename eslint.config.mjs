import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // TypeScript rules - balanced approach
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off', // Allow any types for now
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Allow || for now
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',

      // React rules - practical defaults
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',
      'react-hooks/exhaustive-deps': 'warn',

      // General code quality - practical approach
      'no-console': 'off', // Allow console statements in development
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-unused-expressions': 'warn',
      'no-debugger': 'error',

      // Import rules - simplified
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'warn',
    },
  },
  {
    files: ['app/**/*.tsx', 'app/**/*.ts'],
    rules: {
      // Allow default exports for Next.js app router pages
      'import/no-default-export': 'off',
    },
  },
  {
    // Disable type-aware rules for config files
    files: [
      '*.config.*',
      '*.mjs',
      '*.js',
      'scripts/**/*',
      'tests/**/*',
      'debug-*.js',
      'test-*.js',
      'test-*.mjs',
    ],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      'no-console': 'off',
    },
  },
];

export default eslintConfig;
