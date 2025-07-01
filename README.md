# CODAC - Code Academy Berlin Community Platform

A comprehensive learning management system and community platform for Code Academy Berlin students and alumni.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **pnpm** (will be installed by setup scripts)

### Installation

1. **Clone and setup**

   ```bash
   git clone https://github.com/codeacademyberlin/codac.git
   cd codac
   node setup.js  # Cross-platform setup script
   ```

2. **Configure environment**

   ```bash
   cp env.template .env
   ```

3. **Start development**
   ```bash
   pnpm dev
   ```

## ✨ Features

- **🎓 Learning Management** - Courses, lessons, progress tracking
- **👥 Community Platform** - Student directory, cohorts, discussions
- **💼 Career Hub** - Job board, mentorship, portfolio management
- **📝 Rich Content Editor** - Advanced Plate.js editor for educational content
- **🔐 Authentication** - Role-based access for Students, Alumni, Mentors, Admins

## 🛠 Tech Stack

- **Next.js 15** with TypeScript
- **Prisma** + SQLite (PostgreSQL ready)
- **Tailwind CSS 4** + Shadcn/UI
- **NextAuth.js v5**
- **Plate.js** rich text editor

## 📁 Project Structure

```
codac/
├── app/           # Next.js app router pages
├── components/    # React components
├── actions/       # Server actions
├── lib/          # Utilities
└── prisma/       # Database schema
```

## 🔧 Development

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm lint         # Run linting
pnpm ts:check     # Type checking

# Database
pnpm db:push      # Apply schema changes
pnpm db:seed      # Seed with sample data
pnpm db:reset     # Reset database
```

## 🧪 Test Accounts

- **Student:** alex.mueller@student.codeacademyberlin.com
- **Alumni:** lisa.weber@alumni.codeacademyberlin.com
- **Instructor:** dr.anna.hoffmann@instructor.codeacademyberlin.com

## 📋 Environment Setup

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm lint` and `pnpm ts:check`
5. Submit a pull request

## 📚 Documentation

Additional documentation available in the `dev-docs/` directory for detailed setup guides and feature documentation.
