# CODAC - Code Academy Berlin community

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

### Quick Start (Recommended for Students)

1. **Clone the repository**

   ```bash
   git clone https://github.com/codeacademyberlin/codac.git
   cd codac
   ```

2. **Run the automated setup**

   **Windows users:**

   ```bash
   setup.bat
   ```

   **Mac/Linux users:**

   ```bash
   ./setup.sh
   ```

   **Alternative (all platforms):**

   ```bash
   node setup.js
   ```

   This will automatically:

   - Check prerequisites (Node.js 18+)
   - Install dependencies
   - Create environment files
   - Set up the database
   - Seed sample data
   - Handle common errors
   - Create missing directories (like `docs/`)

3. **Start development**

   ```bash
   pnpm dev
   ```

4. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Manual Installation (Advanced)

If you prefer manual setup or encounter issues:

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Set up environment variables**

   Create a `.env` file with:

   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Initialize the database**

   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

### Troubleshooting

If you encounter issues:

- **Database errors**: Try `pnpm db:reset` to reset the database
- **Permission errors**: Ensure you have write permissions in the project directory
- **Port conflicts**: The app runs on port 3000, make sure it's available
- **Node.js version**: Ensure you're using Node.js 18 or higher

For more help, check the [Issues](https://github.com/codeacademyberlin/codac/issues) or ask your instructor.

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
__
|
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

## 👨‍💻 Collaboration Guide for Beginner Developers

Welcome, Code Academy Berlin students! This section will help you collaborate effectively on the CODAC project, even if you're new to working with codebases.

### 🔄 Git Workflow for Beginners

Fork or clone the repositiry on GitHub

#### 1. Setting Up Your Development Environment

Before making any changes, ensure you have the project running locally:

```bash
# Make sure you're in the project directory
cd codac

# Always pull the latest changes before starting work
git pull origin main

# Create your own branch for the feature you're working on
git checkout -b feature/your-feature-name
```

#### 2. Branch Naming Conventions

Use descriptive branch names that indicate what you're working on:

- `feature/add-user-profile` - For new features
- `fix/login-button-issue` - For bug fixes
- `docs/update-readme` - For documentation updates
- `style/improve-button-design` - For UI/styling changes

#### 3. Making Changes Safely

Before making changes, create a new branch and test your setup:

```bash
# Start the development server to make sure everything works
pnpm dev

# Make your changes in small, focused commits
# Test your changes before committing
```

#### 4. Commit Message Guidelines

Write clear, descriptive commit messages:

```bash
# Good commit messages:
git commit -m "Add user registration form validation"
git commit -m "Fix navigation menu on mobile devices"
git commit -m "Update README with installation instructions"

# Bad commit messages:
git commit -m "fixes"
git commit -m "update"
git commit -m "wip"
```

### 📋 Development Best Practices

#### Before You Start Coding

1. **Check existing issues** - Look at GitHub issues to see if someone is already working on what you want to do
2. **Create an issue** - If your idea isn't covered, create a new issue to discuss it
3. **Ask questions** - Don't hesitate to ask in Discord or GitHub discussions

#### While Coding

1. **Follow the project structure** - Put files in the correct folders (see Project Structure above)
2. **Use TypeScript** - The project uses TypeScript, so make sure your code is type-safe
3. **Follow naming conventions** - Use camelCase for variables, PascalCase for components
4. **Test your changes** - Always test your changes before pushing

#### Code Style Guidelines

```typescript
// ✅ Good: Clear component names and structure
export function UserProfileCard({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-card p-6 rounded-lg">
      <h2 className="text-xl font-semibold">{user.name}</h2>
    </div>
  );
}

// ❌ Avoid: Unclear names and poor structure
export default function Card(props: any) {
  return <div style={{ background: "white" }}>{props.data}</div>;
}
```

### 🔍 Common Development Tasks

#### Adding a New Component

1. Create the component in the appropriate folder under `components/`
2. Use TypeScript interfaces for props
3. Follow the existing design system (Tailwind classes)
4. Export the component using named exports

```typescript
// components/ui/user-avatar.tsx
interface UserAvatarProps {
  user: {
    name: string;
    avatar?: string;
  };
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  // Component implementation
}
```

#### Adding a New Page

1. Create the page in the `app/` directory following Next.js App Router conventions
2. Use Server Components when possible
3. Add proper TypeScript types for params and search params

```typescript
// app/courses/[id]/page.tsx
interface CoursePageProps {
  params: {
    id: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  // Page implementation
}
```

#### Database Changes

1. Update the Prisma schema in `prisma/schema.prisma`
2. Create a migration: `pnpm db:push`
3. Update TypeScript types if needed
4. Test with sample data

### 🚨 Debugging Common Issues

#### TypeScript Errors

```bash
# Check for TypeScript errors
pnpm build

# Fix common issues:
# - Missing imports
# - Incorrect prop types
# - Unused variables
```

#### Database Issues

```bash
# Reset the database if needed
pnpm db:reset

# Re-seed with sample data
pnpm db:seed
```

#### Package Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

### 📝 Pull Request Process

#### Before Creating a PR

1. **Test thoroughly** - Make sure your changes work correctly
2. **Check for conflicts** - Merge main into your branch if needed
3. **Review your changes** - Use `git diff` to see what you've changed

#### Creating a Good PR

1. **Use a descriptive title** - "Add user profile editing functionality"
2. **Write a clear description** - Explain what you changed and why
3. **Add screenshots** - For UI changes, include before/after screenshots
4. **Link related issues** - Use "Closes #123" to link to issues

#### PR Template

```markdown
## What does this PR do?

Brief description of the changes

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Style/UI improvement

## Testing

- [ ] I have tested this change locally
- [ ] I have checked that existing functionality still works

## Screenshots (if applicable)

Before: [screenshot]
After: [screenshot]
```

### 🆘 Getting Help

#### When You're Stuck

1. **Read error messages carefully** - They often tell you exactly what's wrong
2. **Check the documentation** - Look at Next.js, React, or Prisma docs
3. **Search existing issues** - Someone might have had the same problem
4. **Ask for help** - Don't be afraid to ask questions!

#### Where to Ask for Help

- **GitHub Discussions** - For general questions about the project
- **Discord** - For real-time help and community support
- **GitHub Issues** - For bugs or feature requests
- **Code Review** - Ask for feedback on your PRs

#### Questions to Include When Asking for Help

1. What are you trying to do?
2. What did you expect to happen?
3. What actually happened?
4. What error messages did you see?
5. What have you already tried?

### 🎯 Good First Issues

If you're looking for ways to contribute, look for issues labeled:

- `good first issue` - Perfect for beginners
- `documentation` - Help improve docs
- `bug` - Fix existing problems
- `enhancement` - Small improvements

### 📚 Learning Resources

- **Next.js Documentation** - https://nextjs.org/docs
- **React Documentation** - https://react.dev
- **TypeScript Handbook** - https://www.typescriptlang.org/docs
- **Tailwind CSS** - https://tailwindcss.com/docs
- **Prisma Documentation** - https://www.prisma.io/docs

Remember: Every expert was once a beginner. Don't be afraid to make mistakes – that's how we learn! The Code Academy Berlin community is here to support you.

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
