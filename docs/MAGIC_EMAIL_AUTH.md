# Magic Email Authentication Setup

## Overview

Magic email authentication has been implemented to allow alumni to join the CODAC platform using a passwordless sign-in flow. Alumni can enter their email address and receive a secure magic link to sign in without needing a password.

## Features Implemented

### 1. Resend Provider

- Integrated Resend provider into NextAuth configuration
- Configured with Resend API key for reliable email delivery
- Custom email templates with CODAC branding

### 2. Custom Email Templates

- **HTML Template**: Beautiful branded email with purple gradient CODAC logo, clear CTA button, and responsive design
- **Plain Text Template**: Fallback for email clients that don't support HTML
- Both templates include:
  - Branded CODAC design
  - Clear call-to-action button
  - Link expiration notice (24 hours)
  - Security information
  - Fallback plain text link

### 3. Sign-In Form Updates

- Existing users can still sign in with email/password
- New "Alumni Access" section added with:
  - Clear visual separation
  - Dedicated magic link form
  - Success feedback when email is sent
  - Auto-redirect to verify-request page

### 4. Verify Request Page

- Already existed and works perfectly with the new flow
- Shows confirmation message after magic link is sent
- Provides helpful instructions

## Environment Variables Required

Make sure these variables are set in your `.env` file:

```bash
# Resend API Configuration
AUTH_RESEND_KEY=re_your_api_key_here

# Optional: Custom "from" address (must be a verified domain in Resend)
EMAIL_FROM=noreply@yourdomain.com
```

## How It Works

### For Alumni:

1. Navigate to `/auth/signin`
2. Scroll to the "Alumni Access" section
3. Enter their email address
4. Click "Send Magic Link"
5. Check their email for the sign-in link
6. Click the link to authenticate
7. Automatically signed in and redirected to the dashboard

### Security:

- Magic links expire after 24 hours
- Links are single-use (handled by NextAuth)
- Email verification ensures user owns the email address
- Users are created in the database on first sign-in (via PrismaAdapter)

## User Flow

```
┌─────────────────┐
│  Sign-In Page   │
└────────┬────────┘
         │
         ├─► Existing User → Email + Password → Dashboard
         │
         └─► Alumni → Email Only → Magic Link Sent
                                    │
                                    ▼
                            ┌───────────────┐
                            │ Verify Page   │
                            │ Check Email   │
                            └───────┬───────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │  Email Inbox  │
                            │  Click Link   │
                            └───────┬───────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │  Dashboard    │
                            │  (Signed In)  │
                            └───────────────┘
```

## Testing

To test the magic email authentication:

1. Ensure your environment variables are correctly set
2. Start the development server: `pnpm dev`
3. Navigate to `http://localhost:3000/auth/signin`
4. Scroll to the "Alumni Access" section
5. Enter a valid email address
6. Check the email inbox for the magic link
7. Click the link to sign in

## Database Tables Used

The following Prisma/NextAuth tables are involved:

- `User` - Stores user information
- `Account` - Stores authentication provider details
- `VerificationToken` - Stores magic link tokens (auto-cleaned after use)

## Files Modified/Created

### Created:

- `lib/auth/email-template.ts` - Custom email templates

### Modified:

- `lib/auth/auth.ts` - Added Resend provider
- `components/auth/signin-form.tsx` - Added alumni magic link section
- `package.json` - Added resend dependency

### Already Existed (No Changes):

- `app/auth/verify-request/page.tsx` - Verification confirmation page

## Troubleshooting

### Email Not Sending

- Verify `AUTH_RESEND_KEY` environment variable is set correctly
- Ensure your Resend API key is active and valid
- Check that the `EMAIL_FROM` address uses a verified domain in Resend
- Check server logs for detailed error messages
- Verify you haven't exceeded Resend's rate limits

### Magic Link Not Working

- Verify link hasn't expired (24 hour limit)
- Check that `AUTH_URL` environment variable is set correctly
- Ensure cookies are enabled in browser
- Check browser console for errors

### User Creation Issues

- Verify Prisma schema includes all required fields
- Check database connection
- Review server logs for Prisma errors

## Production Considerations

1. **Email Service**: Resend provides reliable email delivery with excellent deliverability
2. **Domain Verification**: Verify your domain in Resend for better deliverability and custom "from" addresses
3. **Rate Limiting**: Consider implementing rate limiting on magic link requests
4. **Email Verification**: Current implementation auto-verifies email on first sign-in
5. **Logging**: Monitor email sending success/failure rates in Resend dashboard
6. **Spam Prevention**: Resend handles SPF/DKIM/DMARC automatically for verified domains

## Support

For issues or questions:

1. Check server logs for detailed error messages
2. Verify environment variables are correctly set (`AUTH_RESEND_KEY`, `EMAIL_FROM`)
3. Check Resend dashboard for email delivery status and logs
4. Ensure your domain is verified in Resend for production use
5. Review NextAuth documentation: https://next-auth.js.org/providers/email
6. Review Resend documentation: https://resend.com/docs
