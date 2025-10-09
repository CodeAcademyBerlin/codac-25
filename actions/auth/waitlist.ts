"use server";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").optional().nullable(),
  message: z.string().max(500, "Message must be less than 500 characters").optional().nullable(),
});

export type WaitlistResult = {
  success: boolean;
  message: string;
};

export async function addToWaitlist(formData: FormData): Promise<WaitlistResult> {
  try {
    const rawEmail = formData.get("email");
    const rawName = formData.get("name");
    const rawMessage = formData.get("message");

    // Convert empty strings to null for optional fields
    const rawData = {
      email: rawEmail,
      name: rawName === "" ? null : rawName,
      message: rawMessage === "" ? null : rawMessage,
    };

    logger.info("Waitlist request received (raw data)", {
      metadata: {
        email: rawData.email,
        name: rawData.name,
        hasMessage: !!rawData.message,
      },
    });

    const { email, name, message } = waitlistSchema.parse(rawData);

    logger.info("Waitlist request validated", {
      metadata: { email, name },
    });

    // Check if email is already on waitlist
    const existingWaitlist = await prisma.waitlist.findUnique({
      where: { email },
    });

    if (existingWaitlist) {
      return {
        success: false,
        message: "This email is already on our waitlist. We'll notify you when access becomes available.",
      };
    }

    // Add to waitlist
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email,
        name: name || null,
        message: message || null,
      },
    });

    logger.info("Waitlist entry created in database", {
      metadata: { email, id: waitlistEntry.id },
    });

    // Send confirmation email (non-blocking - don't fail if email fails)
    try {
      const host = new URL(process.env.AUTH_URL || "http://localhost:3000").host;

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "You're on the CODAC waitlist!",
        text: waitlistConfirmationText({ email, host }),
        html: waitlistConfirmationHtml({ email, host }),
      });

      logger.info("Waitlist confirmation email sent", {
        metadata: { email },
      });
    } catch (emailError) {
      // Log email error but don't fail the waitlist addition
      logger.error("Failed to send waitlist confirmation email", emailError instanceof Error ? emailError : new Error(String(emailError)), {
        metadata: { email },
      });
    }

    return {
      success: true,
      message: "You've been added to our waitlist! We'll notify you when access becomes available.",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Failed to add to waitlist", error instanceof Error ? error : new Error(String(error)), {
      metadata: {
        email: formData.get("email"),
        errorMessage,
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    });

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

/**
 * HTML email template for waitlist confirmation
 */
function waitlistConfirmationHtml(params: { email: string; host: string }) {
  const { email, host } = params;

  const brandColor = "#8b5cf6";
  const buttonColor = "#8b5cf6";
  const buttonTextColor = "#ffffff";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the CODAC waitlist!</title>
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
                You're on the waitlist! 🎉
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #6b7280;">
                Thank you for your interest in CODAC! We've added <strong>${email}</strong> to our waitlist.
              </p>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #111827;">
                  What happens next?
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                  <li>We'll notify you when we open access to the broader community</li>
                  <li>You'll be among the first to know about new features and updates</li>
                  <li>We'll send you exclusive content and learning resources</li>
                </ul>
              </div>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #9ca3af;">
                During the beta phase, access is limited to Code Academy Berlin alumni only. 
                We're working hard to make CODAC available to everyone soon!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 12px; line-height: 18px; color: #9ca3af;">
                Questions? Reply to this email and we'll get back to you.
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
 * Plain text email template for waitlist confirmation (fallback)
 */
function waitlistConfirmationText(params: { email: string; host: string }) {
  const { email } = params;
  return `You're on the CODAC waitlist! 🎉

Thank you for your interest in CODAC! We've added ${email} to our waitlist.

What happens next?
- We'll notify you when we open access to the broader community
- You'll be among the first to know about new features and updates  
- We'll send you exclusive content and learning resources

During the beta phase, access is limited to Code Academy Berlin alumni only. 
We're working hard to make CODAC available to everyone soon!

Questions? Reply to this email and we'll get back to you.

© ${new Date().getFullYear()} CODAC - Share your learning journey with the community.`;
}
