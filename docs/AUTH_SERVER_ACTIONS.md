# Authentication Server Actions

This document outlines the server actions used for authentication in the CODAC platform.

## Overview

All authentication operations now use Next.js server actions instead of client-side API calls. This provides:

- **Better Security**: Credentials and sensitive operations handled server-side
- **Type Safety**: Full TypeScript support with Zod validation
- **Consistent Error Handling**: Centralized error logging and user feedback
- **Better Performance**: Reduced client-side bundle size

## Server Actions

### 1. Sign In Actions (`actions/auth/signin.ts`)

#### `signInWithCredentials(formData: FormData)`

Sign in using email and password (credentials provider).

**Parameters:**

- `email` (FormData): User's email address
- `password` (FormData): User's password
- `callbackUrl` (FormData, optional): URL to redirect after successful sign-in

**Returns:** `SignInResult`

```typescript
{
  success: boolean;
  error?: string;
  redirectUrl?: string;
}
```

**Example Usage:**

```tsx
const formData = new FormData();
formData.append('email', 'user@example.com');
formData.append('password', 'password123');
formData.append('callbackUrl', '/dashboard');

const result = await signInWithCredentials(formData);
if (result.success) {
  router.push(result.redirectUrl);
} else {
  setError(result.error);
}
```

#### `signInWithMagicLink(formData: FormData)`

Sign in using a magic link sent to the user's email (Resend provider).

**Parameters:**

- `email` (FormData): User's email address
- `callbackUrl` (FormData, optional): URL to redirect after email verification

**Returns:** `SignInResult`

**Example Usage:**

```tsx
const formData = new FormData();
formData.append('email', 'user@example.com');
formData.append('callbackUrl', '/dashboard');

const result = await signInWithMagicLink(formData);
if (result.success) {
  router.push('/auth/verify-request');
}
```

#### `signInWithOAuth(provider, callbackUrl?)`

Sign in using OAuth providers (Google or GitHub).

**Parameters:**

- `provider`: `"google"` | `"github"`
- `callbackUrl` (optional): URL to redirect after OAuth flow

**Example Usage:**

```tsx
await signInWithOAuth('google', '/dashboard');
```

#### `signOutAction(callbackUrl?)`

Sign out the current user and optionally redirect.

**Parameters:**

- `callbackUrl` (optional): URL to redirect after sign-out (default: `/auth/signin`)

**Example Usage:**

```tsx
await signOutAction('/');
```

### 2. Alumni Check Action (`actions/auth/check-alumni.ts`)

#### `checkAlumniStatus(email: string)`

Check if a user is pre-registered in the database (alumni verification).

**Parameters:**

- `email`: User's email address to check

**Returns:** `AlumniCheckResult`

```typescript
{
  isAlumni: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    status: string;
    cohort: {
      name: string;
      slug: string;
    } | null;
  };
}
```

**Example Usage:**

```tsx
const result = await checkAlumniStatus('user@example.com');
if (result.isAlumni) {
  console.log('Verified alumni:', result.user);
} else {
  console.log('Not an alumni:', result.message);
}
```

### 3. Waitlist Action (`actions/auth/waitlist.ts`)

#### `addToWaitlist(formData: FormData)`

Add a non-alumni user to the waitlist for future access.

**Parameters:**

- `email` (FormData): User's email address
- `name` (FormData, optional): User's name
- `message` (FormData, optional): Why they're interested in CODAC

**Returns:** `WaitlistResult`

```typescript
{
  success: boolean;
  message: string;
}
```

**Example Usage:**

```tsx
const formData = new FormData();
formData.append('email', 'user@example.com');
formData.append('name', 'John Doe');
formData.append('message', 'Interested in learning coding');

const result = await addToWaitlist(formData);
toast.success(result.message);
```

### 4. Password Reset Actions (`actions/auth/password-reset.ts`)

#### `requestPasswordReset(email: string)`

Request a password reset link to be sent to the user's email.

**Parameters:**

- `email`: User's email address

**Returns:** `PasswordResetResult`

#### `resetPassword(token: string, password: string)`

Reset the user's password using a valid reset token.

**Parameters:**

- `token`: Password reset token from email
- `password`: New password

**Returns:** `PasswordResetResult`

## Beta Phase Access Control

During the beta phase, the following restrictions apply:

1. **Magic Link Sign-In**: Only pre-registered users can receive magic links
2. **Password Reset**: Only existing users can request password resets
3. **Alumni Check**: Verifies user exists in database before granting access
4. **Waitlist**: Non-alumni users are redirected to waitlist form

### Error Messages

Beta phase error message:

```
"Access is currently limited to pre-registered users during the beta phase.
Please contact support if you believe this is an error."
```

## Logging

All server actions include comprehensive logging:

- **Info Logs**: Successful operations, user actions
- **Error Logs**: Failed operations with error details and stack traces
- **Metadata**: User email, operation type, timestamps, error context

Example log output:

```typescript
[2025-10-09T10:55:01.250Z] INFO: Credentials sign-in attempt
  Context: {
    "metadata": {
      "email": "user@example.com"
    }
  }
```

## Error Handling

All server actions use a consistent error handling pattern:

1. **Validation**: Zod schemas validate input data
2. **Try-Catch**: Wrap operations in try-catch blocks
3. **Logging**: Log errors with context and stack traces
4. **User Feedback**: Return user-friendly error messages
5. **Type Safety**: Properly typed error objects

## Migration from Client-Side

### Before (Client-Side)

```tsx
const result = await signIn('credentials', {
  email,
  password,
  redirect: false,
});
```

### After (Server Actions)

```tsx
const formData = new FormData();
formData.append('email', email);
formData.append('password', password);

const result = await signInWithCredentials(formData);
```

## Security Benefits

1. **Credentials Never Exposed**: Form data processed server-side
2. **CSRF Protection**: Built into Next.js server actions
3. **Rate Limiting**: Can be added at server action level
4. **Centralized Validation**: Zod schemas ensure data integrity
5. **Audit Trail**: Comprehensive logging for security monitoring

## Testing

To test authentication flows:

1. **Credentials Sign-In**: Use test user credentials
2. **Magic Link**: Check email and click verification link
3. **Alumni Check**: Test with both existing and non-existing users
4. **Waitlist**: Verify email confirmation is sent
5. **Password Reset**: Complete full reset flow

## Future Enhancements

- [ ] Add rate limiting to prevent abuse
- [ ] Implement session management server actions
- [ ] Add two-factor authentication server actions
- [ ] Enhance logging with request IDs for tracing
- [ ] Add analytics for authentication metrics
