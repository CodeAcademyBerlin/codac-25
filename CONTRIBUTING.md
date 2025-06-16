# Contributing to CODAC

Welcome to the CODAC project! We're excited to have you contribute to Code Academy Berlin's community platform. This guide will help you understand how to contribute effectively to the project.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Coding Standards](#-coding-standards)
- [Issue Guidelines](#-issue-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Code Review Guidelines](#-code-review-guidelines)
- [Testing Requirements](#-testing-requirements)
- [Documentation Standards](#-documentation-standards)
- [Community Guidelines](#-community-guidelines)

## 🤝 Code of Conduct

### Our Commitment

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity. This project follows the Code Academy Berlin values of respect, collaboration, and continuous learning.

### Expected Behavior

- **Be respectful**: Treat all community members with respect and kindness
- **Be collaborative**: Work together constructively and help others learn
- **Be patient**: Remember that everyone has different experience levels
- **Be inclusive**: Welcome newcomers and create an accessible environment
- **Be constructive**: Provide helpful feedback and suggestions

### Unacceptable Behavior

- Harassment, discrimination, or offensive behavior
- Personal attacks or inflammatory comments
- Sharing private information without consent
- Spam or off-topic discussions
- Any behavior that would be inappropriate in a professional setting

### Reporting Issues

If you experience or witness unacceptable behavior, please report it to:

- Email: conduct@codeacademyberlin.com
- GitHub: Create a private issue or contact maintainers directly

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18+** installed
- **pnpm** package manager (recommended) or npm
- **Git** configured with your GitHub account
- **Basic knowledge** of TypeScript, React, and Next.js
- **Code editor** with TypeScript support (VS Code recommended)

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/codac.git
   cd codac
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/codeacademyberlin/codac.git
   ```
4. **Install dependencies**:
   ```bash
   pnpm install
   ```
5. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```
6. **Initialize database**:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```
7. **Start development server**:
   ```bash
   pnpm dev
   ```

## 🔄 Development Workflow

### Branch Strategy

We use a feature branch workflow:

- **main** - Production-ready code
- **develop** - Integration branch for features
- **feature/\*** - New features
- **fix/\*** - Bug fixes
- **docs/\*** - Documentation updates
- **refactor/\*** - Code refactoring

### Workflow Steps

1. **Sync with upstream**:

   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

2. **Create feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and commit**:

   ```bash
   git add .
   git commit -m "feat: add user profile functionality"
   ```

4. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request** on GitHub

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(auth): add user registration validation
fix(ui): resolve mobile navigation menu bug
docs: update API documentation
style(components): format button component
refactor(hooks): optimize data fetching logic
test(utils): add validation utility tests
chore(deps): update dependencies
```

## 💻 Coding Standards

### File Organization

Follow the established project structure:

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   └── [feature]/         # Feature pages
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── editor/           # Rich text editor
│   └── [feature]/        # Feature-specific components
├── actions/              # Server actions
├── data/                 # Data fetching functions
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── schemas/              # Validation schemas
├── types/                # TypeScript definitions
└── prisma/               # Database schema
```

### Naming Conventions

- **Files**: `kebab-case` (e.g., `user-profile.tsx`)
- **Directories**: `kebab-case` (e.g., `user-management/`)
- **Components**: `PascalCase` (e.g., `UserProfile`)
- **Functions**: `camelCase` (e.g., `getUserProfile`)
- **Variables**: `camelCase` (e.g., `isLoggedIn`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- **Types/Interfaces**: `PascalCase` (e.g., `User`, `UserProfile`)

### TypeScript Guidelines

1. **Use explicit types** for function parameters and return values:

   ```typescript
   function getUserById(id: string): Promise<User | null> {
     // implementation
   }
   ```

2. **Define interfaces** for component props:

   ```typescript
   interface UserCardProps {
     user: User;
     onEdit?: (user: User) => void;
     className?: string;
   }
   ```

3. **Use type guards** for runtime type checking:

   ```typescript
   function isValidUser(user: unknown): user is User {
     return typeof user === "object" && user !== null && "id" in user;
   }
   ```

4. **Avoid `any`** - use specific types or `unknown` when necessary

### React/Next.js Guidelines

1. **Use Server Components** by default, Client Components when needed:

   ```typescript
   // Server Component (default)
   export default function UserList() {
     const users = await getUsers();
     return <div>{/* render users */}</div>;
   }

   // Client Component when needed
   ("use client");
   export function InteractiveButton() {
     const [count, setCount] = useState(0);
     return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
   }
   ```

2. **Use named exports** for components:

   ```typescript
   // ✅ Good
   export function UserProfile({ user }: UserProfileProps) {
     // component
   }

   // ❌ Avoid
   export default function UserProfile({ user }: UserProfileProps) {
     // component
   }
   ```

3. **Follow React hooks rules**:
   - Only call hooks at the top level
   - Only call hooks from React functions
   - Use custom hooks for reusable logic

### Styling Guidelines

1. **Use Tailwind CSS** for styling:

   ```typescript
   <div className="bg-card border rounded-lg p-6 shadow-sm">
     <h2 className="text-xl font-semibold mb-4">Title</h2>
   </div>
   ```

2. **Use CSS modules** for complex styles when needed:

   ```typescript
   import styles from "./component.module.css";
   ```

3. **Follow design system** - use existing color schemes and spacing

4. **Responsive design** - mobile-first approach:
   ```typescript
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
   ```

## 🐛 Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check if it's already fixed** in the latest version
3. **Gather information** about the problem

### Issue Types

Use the appropriate issue template:

- **🐛 Bug Report** - Something isn't working
- **✨ Feature Request** - Suggest a new feature
- **📚 Documentation** - Improve or add documentation
- **🎨 Design** - UI/UX improvements
- **❓ Question** - Ask for help or clarification

### Bug Report Template

```markdown
## Bug Description

Clear description of what the bug is.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened.

## Environment

- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 91, Firefox 89]
- Node.js version: [e.g., 18.17.0]

## Screenshots

If applicable, add screenshots.

## Additional Context

Any other context about the problem.
```

### Feature Request Template

```markdown
## Feature Description

Clear description of the feature you'd like to see.

## Problem Statement

What problem does this feature solve?

## Proposed Solution

How would you implement this feature?

## Alternatives Considered

Other solutions you've considered.

## Additional Context

Any other context or screenshots.
```

## 🔍 Pull Request Process

### Before Submitting

1. **Test your changes** thoroughly
2. **Check code style** with linting tools
3. **Update documentation** if needed
4. **Sync with latest main** branch

### PR Requirements

- **Descriptive title** and description
- **Link to related issues** (use `Closes #123`)
- **Screenshots** for UI changes
- **Testing information**
- **Breaking changes** documentation

### PR Template

```markdown
## What does this PR do?

Brief description of the changes.

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 Style change (formatting, renaming)
- [ ] ♻️ Code refactor (no functional changes)
- [ ] ⚡ Performance improvement

## Related Issues

Closes #(issue number)

## Testing

- [ ] I have tested this change locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] I have checked that existing functionality still works
- [ ] I have updated documentation accordingly

## Screenshots (if applicable)

| Before         | After         |
| -------------- | ------------- |
| ![Before](url) | ![After](url) |

## Breaking Changes

Describe any breaking changes and migration steps.

## Additional Notes

Any additional information or context.
```

### PR Review Process

1. **Automated checks** must pass (CI/CD, linting, tests)
2. **Code review** by at least one maintainer
3. **Testing** by reviewers when applicable
4. **Approval** from maintainers
5. **Merge** using squash and merge strategy

## 👀 Code Review Guidelines

### For Authors

- **Keep PRs small** and focused on a single change
- **Write clear descriptions** of what changed and why
- **Respond promptly** to review feedback
- **Be open to suggestions** and willing to make changes

### For Reviewers

- **Be constructive** and respectful in feedback
- **Explain the reasoning** behind suggestions
- **Focus on code quality**, not personal preferences
- **Acknowledge good work** and improvements
- **Test the changes** when possible

### Review Checklist

- [ ] Code follows project standards and conventions
- [ ] Changes are well-tested and don't break existing functionality
- [ ] Documentation is updated where necessary
- [ ] UI changes are responsive and accessible
- [ ] Performance impact is considered
- [ ] Security implications are addressed

## 🧪 Testing Requirements

### Testing Strategy

1. **Unit Tests** - Test individual functions and components
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test user workflows (when applicable)

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format check
pnpm format:check
```

### Writing Tests

Use the established testing patterns:

```typescript
// Component test example
import { render, screen } from "@testing-library/react";
import { UserProfile } from "./user-profile";

describe("UserProfile", () => {
  it("displays user name correctly", () => {
    const user = { id: "1", name: "John Doe", email: "john@example.com" };
    render(<UserProfile user={user} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});

// Utility function test example
import { validateEmail } from "./validation";

describe("validateEmail", () => {
  it("returns true for valid email", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  it("returns false for invalid email", () => {
    expect(validateEmail("invalid-email")).toBe(false);
  });
});
```

## 📚 Documentation Standards

### Code Documentation

1. **JSDoc comments** for public functions:

   ```typescript
   /**
    * Calculates the user's progress percentage
    * @param completed - Number of completed tasks
    * @param total - Total number of tasks
    * @returns Progress percentage (0-100)
    */
   function calculateProgress(completed: number, total: number): number {
     return Math.round((completed / total) * 100);
   }
   ```

2. **Component documentation**:
   ````typescript
   /**
    * UserProfile component displays user information and allows editing
    *
    * @example
    * ```tsx
    * <UserProfile
    *   user={user}
    *   onEdit={handleEdit}
    *   editable={true}
    * />
    * ```
    */
   interface UserProfileProps {
     /** User object to display */
     user: User;
     /** Callback when user clicks edit */
     onEdit?: (user: User) => void;
     /** Whether the profile can be edited */
     editable?: boolean;
   }
   ````

### README Updates

When adding new features, update the README with:

- Feature descriptions
- Usage examples
- Configuration options
- API documentation (if applicable)

## 🌟 Community Guidelines

### Being a Good Community Member

1. **Help others learn** - Share knowledge and answer questions
2. **Be patient with beginners** - We all started somewhere
3. **Celebrate contributions** - Acknowledge good work
4. **Stay positive** - Maintain a constructive attitude
5. **Follow up on discussions** - Complete conversations you start

### Communication Channels

- **GitHub Issues/PRs** - Technical discussions and bug reports
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat and community support
- **Code Review** - Detailed technical feedback

### Recognition

We recognize contributors through:

- **Contributor list** in README
- **Release notes** mentioning contributors
- **Community shoutouts** in Discord
- **Mentorship opportunities** for regular contributors

## 🎯 Getting Your First Contribution Merged

### Start Small

Look for issues labeled:

- `good first issue` - Perfect for beginners
- `help wanted` - Community input needed
- `documentation` - Documentation improvements
- `bug` - Bug fixes

### Learning Path

1. **Start with documentation** - Fix typos, improve clarity
2. **Fix small bugs** - Simple UI fixes or logic errors
3. **Add small features** - Minor enhancements
4. **Take on bigger challenges** - New features or refactoring

### Success Tips

- **Read the codebase** - Understand existing patterns
- **Ask questions** - Don't hesitate to seek help
- **Start discussions** - Talk about your ideas before implementing
- **Be persistent** - Learning takes time and practice

## 📞 Need Help?

If you need help with contributing:

1. **Check existing documentation**
2. **Search past issues and discussions**
3. **Ask in Discord** for real-time help
4. **Create a GitHub discussion** for detailed questions
5. **Reach out to maintainers** directly if needed

Thank you for contributing to CODAC and helping make Code Academy Berlin's community platform better for everyone! 🚀

---

**Happy Coding! 🎉**
