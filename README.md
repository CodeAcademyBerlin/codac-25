# CODAC - Modern Learning Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.9.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

A comprehensive, production-ready learning management system built with Next.js 15, TypeScript, and modern web technologies. CODAC provides a complete educational platform with advanced content management, community features, and career services.

## ✨ Key Features

### 📚 **Learning Management System**
- **Course Management**: Create and organize multi-module courses with lessons and projects
- **Progress Tracking**: Monitor student progress through comprehensive analytics
- **Enrollment System**: Flexible enrollment management with role-based access
- **Quiz System**: Interactive quizzes with multiple difficulty levels and automated scoring

### 📝 **Advanced Content Editor**
- **Unified Editor**: Plate.js-powered rich text editor with auto-save functionality
- **Media Support**: Image, video, and file upload integration via UploadThing
- **Collaborative Features**: Real-time editing with comments and suggestions
- **Export Options**: Multiple format exports including Markdown and DOCX

### 👥 **Community & Collaboration**
- **Student Cohorts**: Organize learners into cohorts with dedicated spaces
- **Mentorship Program**: Connect students with mentors and schedule sessions
- **Discussion System**: Built-in commenting and discussion features
- **User Profiles**: Comprehensive user profiles with avatar management

### 💼 **Career Services**
- **Job Board**: Integrated job posting and application system
- **Career Tracking**: Monitor job applications and career progress
- **Resume Builder**: Tools for creating and managing professional profiles
- **Networking**: Connect with alumni and industry professionals

### 🔐 **Security & Authentication**
- **NextAuth.js Integration**: Secure authentication with multiple providers (Google, GitHub)
- **Role-Based Access**: Granular permissions for STUDENT, MENTOR, ADMIN, ALUMNI roles
- **Data Protection**: Comprehensive validation using Zod schemas
- **Session Management**: Secure session handling with proper token management

## 🛠️ Technology Stack

### **Core Framework**
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and Server Components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript with strict mode enabled
- **[React 19](https://react.dev/)** - Latest React with concurrent features

### **Database & Backend**
- **[PostgreSQL 13+](https://www.postgresql.org/)** - Robust relational database
- **[Prisma 6.9](https://www.prisma.io/)** - Type-safe database client and ORM
- **[NextAuth.js v5](https://authjs.dev/)** - Comprehensive authentication solution
- **Server Actions** - Modern data mutations without API routes

### **UI & Design System**
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/UI](https://ui.shadcn.com/)** - High-quality component library
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives
- **[Lucide Icons](https://lucide.dev/)** - Beautiful open-source icons

### **Content & Editor**
- **[Plate.js 49](https://platejs.org/)** - Rich text editor with plugins
- **[UploadThing](https://uploadthing.com/)** - File upload and management
- **Auto-save System** - Real-time content persistence
- **Media Support** - Images, videos, and documents

### **Development & Quality**
- **[Playwright](https://playwright.dev/)** - End-to-end testing framework
- **[ESLint 9](https://eslint.org/)** - Code linting and formatting
- **[Zod](https://zod.dev/)** - Schema validation and type inference
- **[pnpm](https://pnpm.io/)** - Fast, efficient package manager

### **AI & Integrations**
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - AI integration toolkit
- **OpenAI API** - AI-powered features and content generation
- **[Resend](https://resend.com/)** - Transactional email service

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

# Code Quality & Testing
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm ts:check         # TypeScript type checking
pnpm test             # Run Playwright E2E tests
pnpm test:ui          # Run tests with interactive UI
pnpm test:headed      # Run tests in headed browser mode

# Content Management
pnpm import:lms       # Import LMS content from markdown
pnpm export:docs      # Export documents to markdown
```

## 🏗️ Project Structure

```
codac-25/
├── app/                   # Next.js app router pages
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


### Authentication & Authorization

- Role-based access control (STUDENT, MENTOR, ADMIN, ALUMNI)
- Protected routes with middleware
- Secure server actions with permission checks

### Database Design

- PostgreSQL with Prisma ORM for development
- Comprehensive schema covering users, courses, documents, and community features
- Efficient queries with proper indexing and relations



## 🧪 Testing & Quality Assurance

CODAC includes comprehensive testing infrastructure to ensure reliability and code quality.

### **Testing Framework**
- **Playwright**: End-to-end testing with cross-browser support
- **TypeScript**: Strict type checking for compile-time error detection
- **ESLint**: Code linting with Next.js and TypeScript rules


### **Running Tests**
```bash
# Run all tests
pnpm test

# Interactive test debugging
pnpm test:ui

# Run specific test files
pnpm test tests/e2e/auth-registration.spec.ts

# Generate test reports
pnpm test:report
```

### **Development Workflow**
1. **Code Quality**: Always run `pnpm lint` and `pnpm ts:check` before committing
2. **Database Updates**: Use `pnpm db:generate` after schema changes
3. **Testing**: Run relevant tests for your changes
4. **Build Verification**: Use `pnpm build` to ensure production compatibility


## 🔧 Environment Configuration

Create a `.env` file in the root directory with the following variables:

### **Database Configuration**
```env
# PostgreSQL Connection (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/codac"
DIRECT_URL="postgresql://username:password@localhost:5432/codac"
```

### **Authentication Setup**
```env
# NextAuth Configuration (Required)
AUTH_SECRET="your-very-secure-secret-key-minimum-32-characters"
AUTH_URL="http://localhost:3000"

# Google OAuth (Required for full functionality)
AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

# Email Provider (Required for magic links)
AUTH_RESEND_KEY="re_your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

## 🤝 Contributing

We welcome contributions to CODAC! Please follow these steps:

1. **Fork & Clone**: Fork the repository and clone your fork
2. **Branch**: Create a feature branch (`git checkout -b feature/amazing-feature`)
3. **Develop**: Make your changes following the project conventions
4. **Quality Checks**: Run `pnpm lint`, `pnpm ts:check`, and relevant tests
5. **Commit**: Use conventional commit messages
6. **Push**: Push to your branch (`git push origin feature/amazing-feature`)
7. **Pull Request**: Open a PR with a clear description of changes

### **Development Guidelines**
- Follow the coding standards outlined in [CLAUDE.md](CLAUDE.md)
- Ensure all tests pass before submitting
- Add tests for new functionality
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

### **Getting Help**
1. 📚 Check the [documentation](dev-docs/) first
2. 🔍 Search existing [GitHub issues](../../issues)
3. 💬 Join our community discussions
4. 🐛 Report bugs with detailed reproduction steps

### **Resources**
- **Setup Issues**: See [SETUP.md](SETUP.md) troubleshooting section
- **Development Guide**: Check [CLAUDE.md](CLAUDE.md) for coding standards
- **Student Guide**: See [STUDENT_SETUP.md](STUDENT_SETUP.md) for user onboarding

---

<div align="center">

**🎓 Built with ❤️ for modern education**

**[Live Demo](https://codac-demo.vercel.app)** • **[Documentation](dev-docs/)** • **[Contributing](CONTRIBUTING.md)**

*Empowering learners with cutting-edge technology*

</div>
