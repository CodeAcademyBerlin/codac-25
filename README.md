# CODAC - Code Academy Berlin Learning Platform

![CODAC Logo](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=CODAC+-+Code+Academy+Berlin)

A comprehensive learning management system and community platform designed specifically for students and alumni of Code Academy Berlin. CODAC facilitates learning, collaboration, and community building among current students and graduates.

## 🎯 Mission

CODAC empowers Code Academy Berlin students and alumni to learn, collaborate, and grow together through a modern, integrated platform that combines educational content delivery with vibrant community features.

## ✨ Key Features

### 📚 Learning Management System

- **Course Management** - Structured learning paths with lessons, assignments, and progress tracking
- **Interactive Content** - Rich text editor powered by Plate.js for creating engaging educational content
- **Progress Tracking** - Detailed analytics on learning progress, completion rates, and time spent
- **Assignment System** - Create, submit, and grade assignments with feedback loops
- **Resource Library** - Centralized repository of learning materials and references

### 👥 Community Platform

- **Discussion Forums** - Engage in topic-based discussions with peers and instructors
- **Project Showcase** - Share and get feedback on portfolio projects
- **Q&A System** - Ask questions and get help from the community
- **Event Management** - Stay updated on workshops, study groups, and networking events

### 🤝 Mentorship & Career Support

- **Mentor Matching** - Connect current students with successful alumni
- **Job Board** - Alumni and partner companies share job opportunities
- **Career Resources** - Interview preparation, resume building, and career guidance
- **Portfolio Management** - Showcase your work and track career progress

### 🏆 Gamification & Engagement

- **Achievement System** - Earn badges and points for various accomplishments
- **Study Streaks** - Track and gamify consistent learning habits
- **Leaderboards** - Friendly competition to motivate learning
- **Community Points** - Reward helpful community participation

## 🛠 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern, accessible UI components
- **Radix UI** - Primitive UI components
- **Plate.js** - Rich text editor for content creation

### Backend & Database

- **Prisma ORM** - Type-safe database access
- **SQLite** - Development database (production uses PostgreSQL)
- **Server Actions** - Next.js server-side mutations
- **Zod** - Runtime type validation

### Additional Tools

- **Lucide Icons** - Beautiful, consistent iconography
- **Recharts** - Data visualization for analytics
- **React Hook Form** - Form management
- **Nuqs** - URL state management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/codeacademyberlin/codac.git
   cd codac
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update the following variables in `.env.local`:

   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the database**

   ```bash
   pnpm db:push
   pnpm db:seed
   ```

5. **Start the development server**

   ```bash
   pnpm dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Sample User Accounts

After seeding, you can log in with these sample accounts:

**Student Account:**

- Email: `alex.mueller@student.codeacademyberlin.com`
- Role: Student
- Cohort: 2024-Web-Dev-Bootcamp

**Alumni Account:**

- Email: `lisa.weber@alumni.codeacademyberlin.com`
- Role: Alumni
- Graduated: 2023

**Instructor Account:**

- Email: `dr.anna.hoffmann@instructor.codeacademyberlin.com`
- Role: Instructor

## 📁 Project Structure

```
codac/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard and overview pages
│   ├── learning/          # Course and lesson pages
│   ├── community/         # Community features
│   ├── career/            # Career center
│   └── mentorship/        # Mentorship system
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Shadcn)
│   ├── editor/           # Rich text editor components
│   └── forms/            # Form components
├── actions/              # Server actions for mutations
├── data/                 # Data fetching functions
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
├── schemas/              # Zod validation schemas
├── types/                # TypeScript type definitions
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🎨 Design System

CODAC uses a carefully crafted design system that reflects Code Academy Berlin's brand:

- **Primary Colors**: Blue (#4F46E5) and Purple (#7C3AED) gradient
- **Typography**: Geist Sans for UI, Geist Mono for code
- **Components**: Built with Shadcn/UI and Radix primitives
- **Icons**: Lucide icons for consistency
- **Responsive**: Mobile-first design approach

## 🔐 User Roles & Permissions

### Students

- Access to enrolled courses and lessons
- Submit assignments and view feedback
- Participate in community discussions
- Connect with mentors
- Track learning progress

### Alumni

- Access to career resources and job board
- Mentor current students
- Share job opportunities
- Participate in alumni network
- Continue learning with advanced courses

### Instructors

- Create and manage course content
- Grade assignments and provide feedback
- Moderate community discussions
- View student analytics
- Manage course enrollments

### Admins

- Full platform management
- User role management
- Course approval and publishing
- Community moderation
- Analytics and reporting

## 🔧 Database Schema

The database is designed to support comprehensive LMS and community features:

### Core Entities

- **Users** - Students, alumni, instructors with role-based access
- **Courses** - Structured learning content with prerequisites
- **Lessons** - Individual learning units with various content types
- **Assignments** - Projects, quizzes, and exercises with grading
- **Progress Tracking** - Detailed learning analytics per user

### Community Features

- **Posts** - Discussion threads, showcases, questions, job postings
- **Comments** - Threaded discussions with rich content
- **Mentorships** - Connections between mentors and mentees
- **Achievements** - Gamification elements with conditions and rewards

### Content Management

- **Documents** - Rich text content for resources and materials
- **Resources** - Links, files, and additional learning materials
- **Versions** - Content versioning for collaborative editing

## 📊 Analytics & Insights

CODAC provides comprehensive analytics for different user types:

- **Student Analytics**: Progress tracking, time spent, achievement unlocks
- **Instructor Analytics**: Student engagement, completion rates, assignment performance
- **Admin Analytics**: Platform usage, community activity, course effectiveness

## 🤝 Contributing

We welcome contributions from the Code Academy Berlin community! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code style and standards
- Development workflow
- Testing requirements
- Pull request process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Technical Issues**: Create an issue on GitHub
- **Feature Requests**: Use our feature request template
- **Community Support**: Join our Discord server
- **Emergency Contact**: support@codeacademyberlin.com

## 🎉 Acknowledgments

- **Code Academy Berlin** - For the vision and mission
- **Students & Alumni** - For feedback and community building
- **Open Source Community** - For the amazing tools and libraries
- **Instructors** - For educational expertise and content creation

---

**Built with ❤️ for the Code Academy Berlin community**

![Footer](https://via.placeholder.com/800x100/F8FAFC/6B7280?text=Empowering+the+next+generation+of+developers+in+Berlin)
