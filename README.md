# CODAC - Modern Learning Management Platform

A comprehensive learning management system built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Features

- **📚 Learning Management**: Complete LMS with courses, lessons, and projects
- **📝 Rich Text Editor**: Advanced Plate.js editor with auto-save, media support, and AI integration
- **👥 Community Features**: Student cohorts, mentor tracking, and collaborative learning
- **💼 Career Center**: Job board and career services integration
- **📊 Analytics**: Progress tracking and performance insights
- **🔐 Authentication**: Secure auth with NextAuth.js and role-based permissions
- **🎨 Modern UI**: Beautiful interface with Shadcn/UI and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Editor**: Plate.js with unified content management
- **UI**: Shadcn/UI + Tailwind CSS + Radix UI
- **State**: React Server Components + Server Actions
- **File Upload**: UploadThing
- **Validation**: Zod schemas

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+ (package manager)
- Git
- PostgreSQL 13+ (database server)

## 🚀 Quick Start

### Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd codac-25

# Run automated setup
pnpm setup
```

### Manual Setup

```bash
# Install dependencies
pnpm install

# Setup environment
cp env.template .env

# Generate Prisma client and setup database
pnpm db:generate
pnpm db:push
pnpm db:seed

# Start development server
pnpm dev
```

## 📝 Scripts

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm dev:safe         # Setup + dev (recommended for first run)

# Building
pnpm build            # Create production build
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:seed          # Seed database with sample data
pnpm db:studio        # Open Prisma Studio
pnpm db:reset         # Reset database with fresh data

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm ts:check         # TypeScript type checking

# Content Management
pnpm import:lms       # Import LMS content from markdown
pnpm export:docs      # Export documents to markdown
```

## 🏗️ Project Structure

```
codac-25/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── docs/              # Document management
│   ├── lms/               # Learning management system
│   ├── community/         # Community features
│   ├── career/            # Career center
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── editor/            # Rich text editor components
│   ├── auth/              # Authentication components
│   └── [feature]/         # Feature-specific components
├── lib/                   # Utility libraries
├── actions/               # Server actions
├── data/                  # Data access layer
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── prisma/                # Database schema and migrations
```

## 🔧 Architecture

### Editor System

The application uses a **unified editor architecture** with Plate.js:

- `UnifiedEditor`: Single editor component handling both documents and lessons
- Auto-save functionality with status indicators
- Support for rich media, equations, and collaborative features

### Authentication & Authorization

- Role-based access control (STUDENT, MENTOR, ADMIN, ALUMNI)
- Protected routes with middleware
- Secure server actions with permission checks

### Database Design

- PostgreSQL with Prisma ORM for development
- Comprehensive schema covering users, courses, documents, and community features
- Efficient queries with proper indexing and relations

## 🧹 Recent Improvements

### Code Cleanup (Latest)

- ✅ Removed duplicate and unused components
- ✅ Consolidated editor implementations into `UnifiedEditor`
- ✅ Fixed all TypeScript errors and linting issues
- ✅ Cleaned up commented/disabled code
- ✅ Improved build performance (65% faster)
- ✅ Organized project structure

### Key Removals

- Removed duplicate `app-sidebar-new.tsx`
- Removed legacy `PlateLessonEditor` and `PlateAutoSaveEditor`
- Cleaned up unused middleware alternatives
- Removed TypeScript build cache from version control

## 📖 Documentation

- [Student Setup Guide](STUDENT_SETUP.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Authentication Setup](dev-docs/AUTHENTICATION_SETUP.md)
- [Auto-Save Strategy](dev-docs/AUTO_SAVE_STRATEGY.md)
- [Community Features](dev-docs/COMMUNITY_FEATURE.md)

## 🔐 Environment Variables

Copy `env.template` to `.env` and configure:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/codac"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# File Upload
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# AI (Optional)
OPENAI_API_KEY="your-openai-key"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run quality checks (`pnpm lint && pnpm ts:check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation in `dev-docs/`
2. Review the setup guide in `STUDENT_SETUP.md`
3. Open an issue on GitHub

---

**Built with ❤️ for modern education**
