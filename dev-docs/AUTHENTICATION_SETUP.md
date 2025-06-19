# Authentication Setup

This project uses NextAuth.js (Auth.js v5) with Prisma adapter for authentication.

## Features

- **Email Magic Links**: Password-less authentication via email
- **Google OAuth**: Sign in with Google account
- **Database Sessions**: Sessions stored in SQLite database
- **Role-based Access**: Support for different user roles (STUDENT, ALUMNI, INSTRUCTOR, ADMIN)
- **User Status**: Track user status (ACTIVE, INACTIVE, GRADUATED)

## Environment Variables

Copy `env.template` to `.env.local` and configure the following variables:

### Required

- `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: Random secret key for JWT signing
- `DATABASE_URL`: SQLite database URL

### Optional (for Google OAuth)

- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

### Optional (for Email Magic Links)

- `EMAIL_SERVER_HOST`: SMTP server host
- `EMAIL_SERVER_PORT`: SMTP server port
- `EMAIL_SERVER_USER`: SMTP username
- `EMAIL_SERVER_PASSWORD`: SMTP password (use app password for Gmail)
- `EMAIL_FROM`: Email address for sending emails

## Setup Instructions

1. **Install dependencies**: Already done with `pnpm add next-auth@beta @auth/prisma-adapter`

2. **Database setup**: The Prisma schema has been updated with NextAuth tables

   ```bash
   pnpm db:push
   ```

3. **Environment variables**: Copy `env.template` to `.env.local` and fill in values

4. **Google OAuth setup** (optional):

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

5. **Email setup** (optional):
   - For Gmail: Enable 2FA and create an app password
   - Use the app password in `EMAIL_SERVER_PASSWORD`

## Usage

### Client Components

```tsx
import { useSession, signIn, signOut } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (session) {
    return (
      <>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      <p>Not signed in</p>
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
```

### Server Components

```tsx
import { auth } from "@/lib/auth";
import { requireAuth, requireAdmin } from "@/lib/auth-utils";

// Get current user (optional)
export default async function Page() {
  const session = await auth();
  return <div>Welcome {session?.user?.name}</div>;
}

// Require authentication
export default async function ProtectedPage() {
  const user = await requireAuth();
  return <div>Hello {user.name}</div>;
}

// Require admin role
export default async function AdminPage() {
  const user = await requireAdmin();
  return <div>Admin panel</div>;
}
```

### API Routes

```tsx
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ user: session.user });
}
```

## Components

- `<UserNav />`: User avatar with dropdown menu (sign in/out)
- `<SignInForm />`: Email and Google sign-in form
- `<SignOutButton />`: Sign out confirmation button

## Pages

- `/auth/signin`: Sign in page
- `/auth/signout`: Sign out confirmation
- `/auth/verify-request`: Email verification notice
- `/auth/error`: Authentication error page

## Middleware

The middleware protects routes and handles redirects:

- Redirects unauthenticated users to sign-in
- Redirects authenticated users away from auth pages
- Preserves callback URLs for post-auth redirects

## Database Schema

The User model has been updated to be compatible with NextAuth:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?

  // Custom fields
  role   UserRole   @default(STUDENT)
  status UserStatus @default(ACTIVE)
  // ... other fields

  // NextAuth relations
  accounts Account[]
  sessions Session[]
}
```

Additional NextAuth tables:

- `Account`: OAuth account information
- `Session`: User sessions
- `VerificationToken`: Email verification tokens
