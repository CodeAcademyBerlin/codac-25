"use server";

import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

const requestPasswordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RequestPasswordResetResult = {
  success: boolean;
  message: string;
};

export type ResetPasswordResult = {
  success: boolean;
  message: string;
};

export async function requestPasswordReset(
  formData: FormData
): Promise<RequestPasswordResetResult> {
  try {
    const { email } = requestPasswordResetSchema.parse({
      email: formData.get("email"),
    });

    logger.info("Password reset requested", {
      metadata: { email },
    });

    // Check if user exists (beta phase - only existing users)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Beta phase: Only existing users can reset passwords
      logger.info("Password reset requested for non-existent user during beta", {
        metadata: { email },
      });
      return {
        success: false,
        message: "Access is currently limited to pre-registered users during the beta phase. Please contact support if you believe this is an error.",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Store reset token in database
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.AUTH_URL}/auth/reset-password?token=${resetToken}`;
    const host = new URL(process.env.AUTH_URL || "http://localhost:3000").host;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Reset your CODAC password",
      text: passwordResetText({ url: resetUrl, host }),
      html: passwordResetHtml({ url: resetUrl, host, email }),
    });

    logger.info("Password reset email sent", {
      metadata: { email, userId: user.id },
    });

    return {
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
    };
  } catch (error) {
    logger.error("Failed to request password reset", error instanceof Error ? error : new Error(String(error)), {
      metadata: { email: formData.get("email") },
    });

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function resetPassword(
  formData: FormData
): Promise<ResetPasswordResult> {
  try {
    const { token, password } = resetPasswordSchema.parse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    logger.info("Password reset attempt", {
      metadata: { token: token.substring(0, 8) + "..." },
    });

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      return {
        success: false,
        message: "Invalid or expired reset token. Please request a new password reset.",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and delete reset token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    logger.info("Password reset successful", {
      metadata: { userId: resetToken.userId },
    });

    return {
      success: true,
      message: "Your password has been reset successfully. You can now sign in with your new password.",
    };
  } catch (error) {
    logger.error("Failed to reset password", error instanceof Error ? error : new Error(String(error)), {
      metadata: { token: formData.get("token")?.toString().substring(0, 8) + "..." },
    });

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

/**
 * HTML email template for password reset
 */
function passwordResetHtml(params: { url: string; host: string; email: string }) {
  const { url, host } = params;

  const brandColor = "#8b5cf6";
  const buttonColor = "#8b5cf6";
  const buttonTextColor = "#ffffff";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your CODAC password</title>
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
                Reset your password
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #6b7280;">
                We received a request to reset your password for your CODAC account. Click the button below to reset your password. This link will expire in 1 hour.
              </p>
              
              <!-- Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: ${buttonColor}; color: ${buttonTextColor}; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.2);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #9ca3af;">
                If you didn't request this password reset, you can safely ignore this email. This reset link was intended for <strong>${params.email}</strong>.
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
 * Plain text email template for password reset (fallback)
 */
function passwordResetText(params: { url: string; host: string }) {
  const { url } = params;
  return `Reset your CODAC password\n\n` +
    `Click the link below to reset your password for your CODAC account:\n\n` +
    `${url}\n\n` +
    `This link will expire in 1 hour.\n\n` +
    `If you didn't request this password reset, you can safely ignore this email.\n\n` +
    `© ${new Date().getFullYear()} CODAC - Share your learning journey with the community.`;
}
