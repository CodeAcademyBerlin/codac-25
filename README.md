# CODAC - Code Academy Berlin Community Platform

![CODAC Logo](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=CODAC+-+Code+Academy+Berlin)

A comprehensive learning management system and community platform designed specifically for students and alumni of Code Academy Berlin. CODAC facilitates learning, collaboration, and community building among current students and graduates.

## 🎯 Mission

CODAC empowers Code Academy Berlin students and alumni to learn, collaborate, and grow together through a modern, integrated platform that combines educational content delivery with vibrant community features.

## ✨ Key Features

### 📚 Learning Management System

- **Rich Content Editor** - Powered by Plate.js for creating engaging educational content with advanced formatting, media embedding, and collaborative editing capabilities
- **Document Management** - Comprehensive document creation, editing, and sharing system with version control and real-time collaboration
- **Course Structure** - Organized learning paths with projects, lessons, and assignments
- **Progress Tracking** - Detailed analytics on learning progress, completion rates, and time spent on various activities
- **Assignment System** - Create, submit, and grade assignments with integrated feedback mechanisms
- **Resource Library** - Centralized repository of learning materials, code examples, and references

### 👥 Community Platform

- **Cohort Management** - Organized student groups with dedicated spaces for each cohort
- **Student Directory** - Browse and connect with current students, alumni, and mentors
- **User Profiles** - Comprehensive profiles with professional information, social links, and achievements
- **Role-Based Access** - Different permissions and features for Students, Alumni, Mentors, Instructors, and Admins
- **Community Posts** - Share updates, ask questions, and engage with the community
- **Discussion System** - Threaded discussions with comments and likes

### 🤝 Mentorship & Career Support

- **Mentor Matching** - Connect current students with successful alumni
- **Job Board** - Alumni and partner companies share job opportunities (planned)
- **Career Resources** - Interview preparation, resume building, and career guidance (planned)
- **Portfolio Management** - Showcase your work and track career progress

### 🏆 Gamification & Engagement

- **Achievement System** - Earn badges and points for various accomplishments
- **Progress Tracking** - Visual progress indicators for courses and projects
- **Community Points** - Reward helpful community participation
- **Learning Analytics** - Detailed insights into learning patterns and performance

## 🛠 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router and latest features
- **TypeScript** - Type-safe development throughout the application
- **Tailwind CSS 4** - Utility-first CSS framework for rapid styling
- **Shadcn/UI** - Modern, accessible UI component library
- **Radix UI** - Primitive UI components for complex interactions
- **Plate.js 49** - Advanced rich text editor for content creation

### Backend & Database

- **Prisma ORM** - Type-safe database access with powerful query capabilities
- **SQLite** - Development database (production ready for PostgreSQL)
- **Server Actions** - Modern Next.js server-side mutations
- **Zod** - Runtime type validation and schema parsing
- **NextAuth.js v5** - Complete authentication solution

### Authentication & Security

- **NextAuth.js v5** - Comprehensive authentication with credential-based login and planned OAuth providers
- **Prisma Adapter** - Seamless database integration for user sessions
- **Role-Based Access Control** - Granular permissions system
- **Secure Avatar Upload** - Image processing and storage with validation

### Additional Tools

- **Lucide Icons** - Beautiful, consistent iconography
- **Recharts** - Data visualization for analytics and dashboards
- **React Hook Form** - Efficient form management with validation
- **Nuqs** - URL state management for better UX
- **Sonner** - Toast notifications for user feedback
- **AI Integration** - OpenAI integration for enhanced editing experience

## 🚀 Implementation Status

### ✅ Completed Features

#### User Management & Authentication

- **Complete Authentication System** - Credential-based login with NextAuth.js v5
- **User Profiles** - Comprehensive profiles with avatar upload, bio, social links
- **Role-Based System** - Students, Alumni, Mentors, Instructors, Admins with appropriate permissions
- **Profile Settings** - Full profile editing with form validation and error handling
- **Avatar Management** - Image upload, resize, and optimization with base64 storage

#### Community Platform

- **Community Dashboard** (`/community`) - Central hub showing all cohorts and students

  - Overview statistics (total students, active students, graduates, active cohorts)
  - Interactive cohort cards with student previews
  - Featured students showcase based on activity
  - Responsive design with comprehensive loading states

- **Cohort Management** (`/community/cohorts/[slug]`) - Individual cohort exploration

  - Detailed cohort information and statistics
  - Complete student directory for each cohort
  - Student activity metrics and profiles
  - SEO-optimized with static generation for performance

- **Role-based Community Pages** (`/community/[userRole]`) - Targeted directory views

  - Students directory with filtering and search capabilities
  - Mentors directory with availability status
  - Alumni showcase with employment statistics
  - Activity-based user rankings and engagement metrics

- **Individual User Pages** (`/community/[userRole]/[userId]`) - Detailed user profiles
  - Complete user information display
  - Social links and professional information
  - Activity history and community contributions
  - Direct messaging capabilities (interface ready)

#### Document Management System

- **Rich Text Editor** - Plate.js powered content creation with advanced features

  - Block-based editing with drag-and-drop
  - Media embedding (images, videos, files)
  - Code blocks with syntax highlighting
  - Mathematical equations and formulas
  - AI-powered assistance and copilot features
  - Export to various formats including Markdown and DOCX

- **Document Organization** - Hierarchical document structure
  - Folder support for content organization
  - Document types (lessons, assignments, resources)
  - Sharing and collaboration features
  - Version control and history tracking

#### Learning Management System

- **Course Structure** - Complete course authoring and management

  - Hierarchical structure: Courses → Projects → Lessons
  - Assignment system with multiple types
  - Resource management and organization
  - Progress tracking and analytics

- **Content Management** - Rich content creation and delivery
  - Multiple lesson types (text, video, interactive)
  - Assignment submission and grading workflow
  - Resource libraries with file management
  - Course prerequisites and dependencies

#### Data Architecture

- **Organized Data Layer** - Clean separation of concerns

  - Data fetching functions in `data/` directory
  - Server actions in `actions/` directory
  - Comprehensive error handling and logging
  - Type-safe operations throughout

- **Database Schema** - Well-designed relational structure
  - User management with cohort relationships
  - Complete learning management system models
  - Community features with posts and interactions
  - Achievement and progress tracking
  - Document collaboration system

### 🚧 In Progress

#### Enhanced Community Features

- **Discussion Forums** - Threaded discussions with moderation
- **Event Management** - Community events and study sessions
- **Study Groups** - Collaborative learning environments
- **Advanced Mentorship** - Structured mentorship programs

#### Advanced Learning Tools

- **Interactive Coding Environment** - In-browser code execution
- **Video Integration** - Enhanced video content delivery
- **Assessment System** - Comprehensive testing and evaluation tools

### 📋 Planned Features

#### OAuth Integration

- **Multiple Providers** - Google, GitHub, and LinkedIn OAuth
- **Social Features** - Enhanced profile linking and sharing

#### Advanced Learning Tools

- **Video Conferencing** - Integrated video calls for mentoring
- **Screen Sharing** - Collaborative debugging and code reviews
- **AI-Powered Tutoring** - Intelligent learning assistance

#### Career Development

- **Job Board** - Industry job postings and career opportunities
- **Portfolio Builder** - Enhanced project showcase capabilities
- **Interview Preparation** - Mock interviews and feedback systems
- **Career Analytics** - Progress tracking and goal setting

#### Mobile & Performance

- **Mobile App** - Native mobile experience
- **Offline Support** - Content access without internet
- **Advanced Analytics** - Detailed learning and engagement metrics

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - JavaScript runtime
- **pnpm** (recommended) or npm - Package manager
- **Git** - Version control

### Quick Start (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/codeacademyberlin/codac.git
   cd codac
   ```

2. **Run the automated setup**

   **Windows:**

   ```cmd
   setup.bat
   ```

   **Mac/Linux:**

   ```bash
   ./setup.sh
   ```

   **Cross-platform:**

   ```bash
   node setup.js
   ```

   This will automatically:

   - Check Node.js version (18+ required)
   - Install dependencies with pnpm/npm
   - Generate Prisma client
   - Set up the SQLite database
   - Seed with sample data

3. **Configure environment variables**

   ```bash
   cp env.template .env
   ```

   Edit `.env` with your configuration:

   - Database URL
   - NextAuth secret and URLs
   - OpenAI API key (optional, for AI features)
   - Upload Thing API keys (for file uploads)

4. **Start the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Accounts

Use these pre-seeded accounts to explore the platform:

- **Student:** alex.mueller@student.codeacademyberlin.com
- **Alumni:** lisa.weber@alumni.codeacademyberlin.com
- **Instructor:** dr.anna.hoffmann@instructor.codeacademyberlin.com

### Manual Setup (Advanced)

If you prefer manual control over the setup process:

1. **Install dependencies**

   ```bash
   pnpm install  # or npm install
   ```

2. **Set up the database**

   ```bash
   pnpm db:generate  # Generate Prisma client
   pnpm db:push      # Create database tables
   pnpm db:seed      # Populate with sample data
   ```

3. **Configure environment**

   ```bash
   cp env.template .env
   # Edit .env with your settings
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

## 📁 Project Structure

```
codac/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── ai/            # AI-powered features
│   │   ├── auth/          # Authentication endpoints
│   │   ├── docs/          # Document management
│   │   └── user/          # User management
│   ├── auth/              # Authentication pages
│   ├── community/         # Community platform pages
│   ├── docs/              # Document management UI
│   ├── learning/          # Learning management system
│   └── profile/           # User profile pages
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── community/         # Community features
│   ├── dashboard/         # Dashboard components
│   ├── editor/            # Rich text editor with Plate.js
│   ├── profile/           # User profile components
│   └── ui/                # Reusable UI components (Shadcn/UI)
├── actions/               # Server actions
│   ├── auth/              # Authentication actions
│   ├── doc/               # Document actions
│   └── user/              # User management actions
├── data/                  # Data fetching functions
│   ├── cohort/            # Cohort data operations
│   ├── docs/              # Document data operations
│   └── user/              # User data operations
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication utilities
│   ├── db/                # Database configuration
│   ├── editor/            # Editor utilities
│   ├── imaging/           # Image processing utilities
│   └── validation/        # Schema validation
├── hooks/                 # Custom React hooks
├── prisma/                # Database schema and migrations
│   ├── seed/              # Seed data files
│   └── schema.prisma      # Database schema
├── scripts/               # Utility scripts
├── types/                 # TypeScript type definitions
└── dev-docs/              # Developer documentation
```

## 🛠 Development Scripts

```bash
# Development
pnpm dev          # Start development server with Turbopack
pnpm dev:safe     # Setup and start development server

# Building & Production
pnpm build        # Create production build
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix linting issues automatically
pnpm ts:check     # Type checking without emitting files

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes to database
pnpm db:seed      # Seed database with sample data
pnpm db:studio    # Open Prisma Studio
pnpm db:reset     # Reset database and reseed

# Utilities
pnpm import:lms   # Import LMS content from external sources
pnpm export:docs  # Export documents to Markdown format

# Setup Commands
pnpm setup        # Automated project setup
pnpm setup:manual # Manual setup process
pnpm setup:force  # Force reset and setup
```

## 🎨 Design System

CODAC uses a comprehensive design system built on:

- **Tailwind CSS 4** - Modern utility-first styling with advanced features
- **Shadcn/UI** - Consistent, accessible component library
- **Radix UI** - Unstyled primitive components for complex interactions
- **Custom Theme** - Carefully crafted color palette and typography optimized for learning
- **Responsive Design** - Mobile-first approach with comprehensive breakpoint system
- **Dark Mode Support** - Complete dark/light theme implementation

## 🔧 Configuration

### Environment Variables

Key environment variables (see `env.template`):

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AI Features (Optional)
OPENAI_API_KEY="your-openai-api-key"

# File Upload (Optional)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Email (Optional)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="username"
EMAIL_SERVER_PASSWORD="password"
EMAIL_FROM="noreply@example.com"
```

### Database Configuration

- **Development**: SQLite for easy local development and testing
- **Production**: PostgreSQL recommended for scalability and performance
- **Migrations**: Automatic schema management with Prisma
- **Seeding**: Comprehensive seed data including users, cohorts, and courses

## 🤝 Contributing

We welcome contributions from the Code Academy Berlin community! Please see our comprehensive [Contributing Guide](CONTRIBUTING.md) for detailed instructions.

### Quick Contributing Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our coding standards
4. Run tests and linting: `pnpm lint` and `pnpm ts:check`
5. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices and maintain type safety
- Write meaningful commit messages using conventional commits
- Test your changes thoroughly across different user roles
- Update documentation when adding new features
- Follow the established code style and project structure

## 📚 Documentation

### Developer Documentation

- [Authentication Setup](dev-docs/AUTHENTICATION_SETUP.md) - Complete auth system guide
- [Community Features](dev-docs/COMMUNITY_FEATURE.md) - Community platform development
- [User Profile System](dev-docs/USER_PROFILE_FEATURE.md) - Profile management guide
- [Auto-save Strategy](dev-docs/AUTO_SAVE_STRATEGY.md) - Document auto-save implementation
- [Avatar Upload System](dev-docs/AVATAR_UPLOAD.md) - Image handling and processing
- [Import LMS Content](dev-docs/IMPORT_LMS_CONTENT.md) - Content migration tools
- [Export Documentation](dev-docs/EXPORT_DOCS_TO_MARKDOWN.md) - Document export system
- [Refactoring Summary](dev-docs/REFACTORING_SUMMARY.md) - Recent architectural changes

### User Documentation

- [Student Setup Guide](STUDENT_SETUP.md) - Quick start guide for students
- [Contributing Guidelines](CONTRIBUTING.md) - Comprehensive contribution guide

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push to main branch

### Other Platforms

- **Netlify**: Full-stack deployment with serverless functions
- **Railway**: Database and hosting in one platform with PostgreSQL
- **Docker**: Containerized deployment for custom infrastructure

### Production Considerations

- Switch to PostgreSQL for production database
- Configure proper environment variables
- Set up monitoring and error tracking
- Implement backup strategies for user data
- Configure CDN for media assets

## 📊 Analytics & Monitoring

- **Built-in Logging**: Comprehensive application logging with structured data
- **Error Tracking**: Structured error handling and reporting throughout the app
- **Performance Monitoring**: Built-in Next.js analytics and performance insights
- **User Analytics**: Learning progress tracking and engagement metrics
- **Database Monitoring**: Prisma query optimization and performance tracking

## 🔒 Security

- **Authentication**: Secure credential-based authentication with NextAuth.js v5
- **Authorization**: Comprehensive role-based access control system
- **Data Validation**: Input sanitization and validation with Zod schemas
- **File Upload Security**: Safe image processing and validation
- **Environment Security**: Proper secret management and environment isolation
- **Database Security**: Prepared statements and SQL injection prevention

## 🆘 Support & Troubleshooting

### Common Issues

1. **Node.js version**: Ensure you're using Node.js 18 or higher
2. **Port conflicts**: Use `pnpm dev --port 3001` if port 3000 is busy
3. **Database issues**: Run `pnpm db:reset` to reset and reseed database
4. **Build errors**: Run `pnpm lint:fix` and `pnpm ts:check` to identify issues

### Getting Help

- **Documentation**: Check our comprehensive dev docs first
- **GitHub Issues**: Report bugs and request features
- **Community**: Connect with other Code Academy Berlin students
- **Discussions**: Use GitHub discussions for questions and ideas

### Support Channels

- **Students**: Ask classmates in your cohort or contact instructors
- **Contributors**: Use GitHub issues and discussions
- **Instructors**: Contact the development team directly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Code Academy Berlin** - For providing the educational foundation and vision
- **Open Source Community** - For the amazing tools, libraries, and frameworks
- **Contributors** - For making this project possible and continuously improving it
- **Students & Alumni** - For feedback, testing, and real-world usage insights
- **Plate.js Team** - For the exceptional rich text editing capabilities
- **Vercel & Next.js Team** - For the outstanding development platform

---

**CODAC** - Empowering the next generation of developers through community-driven learning.

_Built with ❤️ by the Code Academy Berlin community_

For more information, visit [Code Academy Berlin](https://codeacademyberlin.com) or connect with our development team.
