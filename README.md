# codac

## Code Academy Berlin Community

Code Academy Berlin was a local coding school for beginner and career changers that operated in Berlin from 2020 to 2025. It was founded with the vision of creating a unique, local, and community-driven learning environment.

The academy offered two five-month courses, Data Analytics and Web Development, which were designed to give students the opportunity to follow their own ideas, take ownership of their personal projects, and reach individual milestones.

Originally, the codac platform was intended to replace the academy's learning platform and serve as a collaborative open-source project for students to contribute to.

Following the announcement of the academy's closure in 2025, the app was redesigned. It now serves as a tribute to the academy and its community of developers, as well as a place to showcase and discuss new work and projects.

### 💼 **Projects Portfolio**

- **Project Collaboration**: Create and collaborate on projects with GitHub integration.
- **Project Portfolios**: Showcase student projects with GitHub integration.
- **Job Board**: Integrated job posting and offer sharing.
- **Project Comments & Likes**: Community engagement on projects.

### 👥 **Community**

- **Alumni Directory**: Directory of cohorts and alumni.
- **Chat**: Built-in messaging system for direct and group conversations.
- **Forum**: **Reddit-like** forum for sharing memories of the academy.

### 📝 **Documents Editor**

- **Unified Editor**: Plate.js-powered rich text editor with auto-save functionality.
- **Document Management**: Hierarchical folder structure for organizing content.
- **AI-Powered Features**: AI integration for content generation and assistance.

### 📚 **Legacy Learning Management System**

- **Course Management**: Legacy courses with lessons and projects.
- **Quiz System**: Interactive quizzes with multiple difficulty levels and automated scoring.

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
- **Auto-save System** - Real-time content persistence
- **Media Support** - Images, videos, and documents

### **Development & Quality**

- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[React Testing Library](https://testing-library.com/react)** - Component testing utilities
- **[Playwright](https://playwright.dev/)** - End-to-end testing framework
- **[ESLint 9](https://eslint.org/)** - Code linting and formatting
- **[Zod](https://zod.dev/)** - Schema validation and type inference
- **[pnpm](https://pnpm.io/)** - Fast, efficient package manager

### **AI & Integrations**

- **[Vercel AI SDK](https://sdk.vercel.ai/)** - AI integration toolkit
- **OpenAI API** - AI-powered features and content generation

## How to Run

To run the development server, execute the following command in your terminal:

```bash
pnpm dev
```

This will start the Next.js development server with Turbopack. The application will be available at `http://localhost:3000`.

### Prerequisites

Before running the application, make sure you have:

1. **Node.js** (>=22.0.0) and **pnpm** (>=9.0.0) installed
2. **PostgreSQL** database set up and running
3. Environment variables configured (`.env` file)
4. Database initialized:
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

## How to Test

To run the tests for this project, execute the following commands:

### Unit Tests

```bash
pnpm test:unit
```

### End-to-End Tests

```bash
pnpm test:e2e
```

### All Tests

```bash
pnpm test
```

This will run both unit tests (using Vitest) and end-to-end tests (using Playwright).
