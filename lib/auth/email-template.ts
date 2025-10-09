/**
 * HTML email template for magic link authentication
 */
export function html(params: { url: string; host: string; email: string }) {
  const { url } = params;

  const host = process.env.AUTH_URL || "http://localhost:3000";
  const brandColor = '#8b5cf6'; // Purple from codac branding
  const buttonColor = '#8b5cf6';
  const buttonTextColor = '#ffffff';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to CODAC</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 40px 40px 0 40px; text-align: center;">
              <img src="https://${host}/codac.png" alt="CODAC" style="height: 60px; width: auto; margin-bottom: 20px;" />
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; background: linear-gradient(135deg, ${brandColor} 0%, #3b82f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                codac
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #111827;">
                Sign in to CODAC
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #6b7280;">
                Welcome! Click the button below to securely sign in to your CODAC account. This link will expire in 24 hours.
              </p>
              
              <!-- Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: ${buttonColor}; color: ${buttonTextColor}; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.2);">
                      Sign in to CODAC
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #9ca3af;">
                If you didn't request this email, you can safely ignore it. This sign-in link was intended for <strong>${params.email}</strong>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 12px; line-height: 18px; color: #9ca3af;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #6b7280; word-break: break-all;">
                <a href="${url}" target="_blank" style="color: ${brandColor}; text-decoration: none;">
                  ${url}
                </a>
              </p>
              <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 18px; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} CODAC. Share your learning journey with the community.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Plain text email template for magic link authentication (fallback)
 */
export function text(params: { url: string; host: string }) {
  const { url, host } = params;
  return `Sign in to CODAC\n\n` +
    `Click the link below to sign in to your CODAC account:\n\n` +
    `${url}\n\n` +
    `This link will expire in 24 hours.\n\n` +
    `If you didn't request this email, you can safely ignore it.\n\n` +
    `© ${new Date().getFullYear()} CODAC - Share your learning journey with the community.`;
}

