# CODAC Development Setup Guide

This guide will help you set up the CODAC learning platform for local development.

## Prerequisites

- Node.js 18+ 
- pnpm 8+ (package manager)
- PostgreSQL database (local or cloud)

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd codac-25
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values (see detailed setup below)
   ```

3. **Database Setup**
   ```bash
   pnpm db:generate  # Generate Prisma client
   pnpm db:push      # Push schema to database
   pnpm db:seed:all  # Seed with sample data
   ```

4. **Start Development**
   ```bash
   pnpm dev
   ```

## Detailed Environment Configuration

### 1. Database Configuration

#### Option A: Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection strings from Settings > Database
4. Update `.env`:
   ```
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
   ```

#### Option B: Local PostgreSQL
```bash
# Install PostgreSQL locally, then:
createdb codac-dev
```
Update `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/codac-dev"
DIRECT_URL="postgresql://postgres:password@localhost:5432/codac-dev"
```

### 2. Authentication Setup

#### Required: Secret Key
```bash
# Generate a secure secret (32+ characters)
AUTH_SECRET="your-very-long-and-secure-secret-key-here"
```

#### Google OAuth (Required for full functionality)
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Update `.env`:
   ```
   AUTH_GOOGLE_ID="your-google-client-id"
   AUTH_GOOGLE_SECRET="your-google-client-secret"
   ```

### 3. Email Provider Setup

#### Resend (Recommended - Edge Runtime Compatible)
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use their test domain
3. Get API key from dashboard
4. Update `.env`:
   ```
   AUTH_RESEND_KEY="re_your-api-key"
   EMAIL_FROM="auth@yourdomain.com"
   ```

### 4. File Upload Setup

#### UploadThing
1. Sign up at [uploadthing.com](https://uploadthing.com)
2. Create new app
3. Get token from dashboard
4. Update `.env`:
   ```
   UPLOADTHING_TOKEN="your-uploadthing-token"
   ```

### 5. AI Features Setup

#### Gemini API (for embeddings)
1. Get API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update `.env`:
   ```
   GEMINI_API_KEY="your-gemini-api-key"
   ```

## Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes
pnpm db:studio        # Open Prisma Studio
pnpm db:reset         # Reset database and reseed

# Testing
pnpm test             # Run Playwright tests
pnpm test:ui          # Run tests with UI
pnpm lint             # Check code style
pnpm ts:check         # Type checking
```

## Testing Setup

### Database for Tests
For isolated testing, create a separate test database:
```
TEST_DATABASE_URL="postgresql://postgres:password@localhost:5432/codac-test"
```

### Running Tests
```bash
# All tests
pnpm test

# Specific test suites
pnpm test tests/e2e/auth-registration.spec.ts
pnpm test tests/e2e/auth-login.spec.ts

# With UI for debugging
pnpm test:ui
```

## Common Issues & Solutions

### 1. Edge Runtime Error
If you see "The edge runtime does not support Node.js 'stream' module":
- Ensure you're using Resend instead of Nodemailer
- Check that `AUTH_RESEND_KEY` is set in `.env`

### 2. OAuth Redirect URI Mismatch
- Verify redirect URI in Google Console matches: `http://localhost:3000/api/auth/callback/google`
- For production, add your production domain redirect URI

### 3. Database Connection Issues
- Check connection strings are correct
- Ensure database exists and is accessible
- For Supabase, verify pooling settings

### 4. Prisma Issues
```bash
# Reset Prisma client
rm -rf node_modules/.prisma
pnpm db:generate

# Reset database
pnpm db:reset
```

## Production Deployment

### Environment Variables
- Generate new `AUTH_SECRET` (never reuse development secrets)
- Update `AUTH_URL` to production domain
- Use production database URLs
- Configure OAuth redirect URIs for production domain

### Database Migration
```bash
# Generate migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy
```

## Project Structure

```
codac-25/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/                 # Shared utilities
│   ├── auth/           # Authentication configuration
│   ├── db/             # Database utilities
│   └── validation/     # Zod schemas
├── actions/            # Server actions
├── data/              # Database queries
├── tests/             # E2E tests
├── prisma/            # Database schema and migrations
└── public/            # Static assets
```

## Getting Help

1. Check this setup guide first
2. Review error messages carefully
3. Check the [Next.js documentation](https://nextjs.org/docs)
4. Check [NextAuth.js documentation](https://authjs.dev)
5. Open an issue if problems persist

Happy coding! 🚀