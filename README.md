# CODAC - Code Academy Berlin Community Platform

![CODAC Logo](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=CODAC+-+Code+Academy+Berlin)

A comprehensive learning management system and community platform designed specifically for students and alumni of Code Academy Berlin. CODAC facilitates learning, collaboration, and community building among current students and graduates.

## 🎯 Mission

CODAC empowers Code Academy Berlin students and alumni to learn, collaborate, and grow together through a modern, integrated platform that combines educational content delivery with vibrant community features.

## ✨ Key Features

### 📚 Learning Management System

- **Rich Content Editor** - Powered by Plate.js for creating engaging educational content with advanced formatting, media embedding, and collaborative editing capabilities
- **Document Management** - Comprehensive document creation, editing, and sharing system with version control and real-time collaboration
- **Progress Tracking** - Detailed analytics on learning progress, completion rates, and time spent on various activities
- **Assignment System** - Create, submit, and grade assignments with integrated feedback mechanisms
- **Resource Library** - Centralized repository of learning materials, code examples, and references

### 👥 Community Platform

- **Cohort Management** - Organized student groups with dedicated spaces for each cohort
- **Student Directory** - Browse and connect with current students, alumni, and mentors
- **User Profiles** - Comprehensive profiles with professional information, social links, and achievements
- **Role-Based Access** - Different permissions and features for Students, Alumni, Mentors, Instructors, and Admins
- **Discussion Forums** - Engage in topic-based discussions with peers and instructors (planned)

### 🤝 Mentorship & Career Support

- **Mentor Matching** - Connect current students with successful alumni (in development)
- **Job Board** - Alumni and partner companies share job opportunities (planned)
- **Career Resources** - Interview preparation, resume building, and career guidance (planned)
- **Portfolio Management** - Showcase your work and track career progress

### 🏆 Gamification & Engagement

- **Achievement System** - Earn badges and points for various accomplishments (planned)
- **Study Streaks** - Track and gamify consistent learning habits (planned)
- **Leaderboards** - Friendly competition to motivate learning (planned)
- **Community Points** - Reward helpful community participation (planned)

## 🛠 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router and latest features
- **TypeScript** - Type-safe development throughout the application
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Shadcn/UI** - Modern, accessible UI component library
- **Radix UI** - Primitive UI components for complex interactions
- **Plate.js** - Advanced rich text editor for content creation

### Backend & Database

- **Prisma ORM** - Type-safe database access with powerful query capabilities
- **SQLite** - Development database (production ready for PostgreSQL)
- **Server Actions** - Modern Next.js server-side mutations
- **Zod** - Runtime type validation and schema parsing
- **NextAuth.js** - Complete authentication solution with multiple providers

### Authentication & Security

- **NextAuth.js v5** - Comprehensive authentication with Google OAuth, email magic links, and credentials
- **Prisma Adapter** - Seamless database integration for user sessions
- **Role-Based Access Control** - Granular permissions system
- **Secure Avatar Upload** - Image processing and storage with validation

### Additional Tools

- **Lucide Icons** - Beautiful, consistent iconography
- **Recharts** - Data visualization for analytics and dashboards
- **React Hook Form** - Efficient form management with validation
- **Nuqs** - URL state management for better UX
- **Sonner** - Toast notifications for user feedback

## 🚀 Implementation Status

### ✅ Completed Features

#### User Management & Authentication

- **Complete Authentication System** - Google OAuth, email magic links, and credential-based login
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
  - Collaborative editing capabilities
  - Export to various formats

- **Document Organization** - Hierarchical document structure
  - Folder support for content organization
  - Document types (lessons, assignments, resources)
  - Sharing and collaboration features
  - Version control and history tracking

#### Data Architecture

- **Organized Data Layer** - Clean separation of concerns

  - Data fetching functions in `data/` directory
  - Server actions in `actions/` directory
  - Comprehensive error handling and logging
  - Type-safe operations throughout

- **Database Schema** - Well-designed relational structure
  - User management with cohort relationships
  - Document system with collaboration support
  - Achievement and progress tracking foundations
  - Extensible design for future features

### 🚧 In Progress

#### Learning Management System

- **Course Structure** - Building comprehensive course authoring tools
- **Assignment System** - Creating submission and grading workflows
- **Progress Tracking** - Advanced analytics and reporting
- **Learning Paths** - Structured educational journeys

#### Enhanced Community Features

- **Discussion Forums** - Threaded discussions with moderation
- **Direct Messaging** - Private communication between users
- **Event Management** - Community events and study sessions
- **Study Groups** - Collaborative learning environments

### 📋 Planned Features

#### Advanced Learning Tools

- **Interactive Coding Environment** - In-browser code execution
- **Video Conferencing** - Integrated video calls for mentoring
- **Screen Sharing** - Collaborative debugging and code reviews
- **AI-Powered Assistance** - Intelligent tutoring and code suggestions

#### Gamification System

- **Comprehensive Achievements** - Badges for various accomplishments
- **Leaderboards** - Community rankings and competitions
- **Study Streaks** - Habit tracking and motivation
- **Community Challenges** - Group learning activities

#### Career Development

- **Job Board** - Industry job postings and career opportunities
- **Portfolio Builder** - Showcase student projects and achievements
- **Interview Preparation** - Mock interviews and feedback
- **Career Guidance** - Mentorship matching and career planning

#### Technical Enhancements

- **Mobile App** - Native mobile experience
- **Offline Support** - Content access without internet
- **Advanced Analytics** - Detailed learning and engagement metrics
- **API Integration** - Third-party service connections

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
   - Set up the database
   - Seed with sample data

3. **Configure environment variables**

   ```bash
   cp env.template .env
   ```

   Edit `.env` with your configuration:

   - Database URL
   - NextAuth secret and URLs
   - OAuth provider credentials (Google, GitHub, etc.)
   - Upload thing API keys (for file uploads)

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Manual Setup (Advanced)

If you prefer manual control over the setup process:

1. **Install dependencies**

   ```bash
   pnpm install  # or npm install
   ```

2. **Set up the database**

   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Create database tables
   npm run db:seed      # Populate with sample data
   ```

3. **Configure environment**

   ```bash
   cp env.template .env
   # Edit .env with your settings
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
codac/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── community/         # Community platform pages
│   ├── docs/              # Document management
│   ├── profile/           # User profile pages
│   └── ...
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── community/         # Community features
│   ├── editor/            # Rich text editor
│   ├── profile/           # User profile components
│   └── ui/                # Reusable UI components
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
│   └── validation/        # Schema validation
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── types/                 # TypeScript type definitions
```

## 🛠 Development Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run dev:safe     # Setup and start development server

# Building
npm run build        # Create production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues automatically
npm run ts:check     # Type checking without emitting files

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database and reseed

# Utilities
npm run import:lms   # Import LMS content
npm run export:docs  # Export documents to markdown
```

## 🎨 Design System

CODAC uses a comprehensive design system built on:

- **Tailwind CSS** - Utility-first styling with custom configuration
- **Shadcn/UI** - Consistent, accessible component library
- **Radix UI** - Unstyled primitive components
- **Custom Theme** - Carefully crafted color palette and typography
- **Responsive Design** - Mobile-first approach with breakpoint system

## 🔧 Configuration

### Environment Variables

Key environment variables (see `env.template`):

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Upload Thing (for file uploads)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

### Database Configuration

- **Development**: SQLite for easy local development
- **Production**: PostgreSQL recommended for scalability
- **Migrations**: Automatic schema management with Prisma

## 🤝 Contributing

We welcome contributions from the Code Academy Berlin community!

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `npm run lint` and `npm run ts:check`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation when needed
- Follow the existing code style

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📚 Documentation

- [Authentication Setup](dev-docs/AUTHENTICATION_SETUP.md)
- [Community Features](dev-docs/COMMUNITY_FEATURE.md)
- [User Profile System](dev-docs/USER_PROFILE_FEATURE.md)
- [Auto-save Strategy](dev-docs/AUTO_SAVE_STRATEGY.md)
- [Avatar Upload System](dev-docs/AVATAR_UPLOAD.md)
- [Student Setup Guide](STUDENT_SETUP.md)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically on every push

### Other Platforms

- **Netlify**: Full-stack deployment support
- **Railway**: Database and hosting in one platform
- **Docker**: Containerized deployment options

## 📊 Analytics & Monitoring

- **Built-in Logging**: Comprehensive application logging
- **Error Tracking**: Structured error handling and reporting
- **Performance Monitoring**: Built-in Next.js analytics
- **User Analytics**: Learning progress and engagement metrics

## 🔒 Security

- **Authentication**: Secure multi-provider authentication
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **File Upload Security**: Safe file handling and processing
- **Environment Security**: Proper secret management

## 🆘 Support

- **Documentation**: Comprehensive guides and API references
- **Community**: Code Academy Berlin student community
- **Issues**: GitHub issue tracker for bugs and feature requests
- **Discussions**: GitHub discussions for questions and ideas

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Code Academy Berlin** - For providing the educational foundation
- **Open Source Community** - For the amazing tools and libraries
- **Contributors** - For making this project possible
- **Students & Alumni** - For feedback and real-world testing

---

**CODAC** - Empowering the next generation of developers through community-driven learning.

For more information, visit [Code Academy Berlin](https://codeacademyberlin.com) or reach out to our development team.
