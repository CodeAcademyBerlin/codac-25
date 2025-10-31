import { prisma } from "@/lib/db";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import {
	admin,
	bearer,
	customSession,
	deviceAuthorization,
	lastLoginMethod,
	multiSession,
	oAuthProxy,
	oneTap,
	openAPI,
	organization,
	twoFactor,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { reactInvitationEmail } from "./email/invitation";
import { resend } from "./email/resend";
import { reactResetPasswordEmail } from "./email/reset-password";
import { siteConfig } from "@/config/site";

const from = siteConfig.email.from;
const to = siteConfig.email.testEmail;



const baseURL: string =
	process.env.VERCEL === "1"
		? process.env.VERCEL_ENV === "production"
			? process.env.BETTER_AUTH_URL || siteConfig.url
			: process.env.VERCEL_ENV === "preview"
				? `https://${process.env.VERCEL_URL}`
				: siteConfig.url
		: process.env.BETTER_AUTH_URL || siteConfig.url;

const cookieDomain: string | undefined =
	process.env.VERCEL === "1"
		? process.env.VERCEL_ENV === "production"
			? process.env.BETTER_AUTH_URL ? new URL(process.env.BETTER_AUTH_URL).hostname : undefined
			: process.env.VERCEL_ENV === "preview"
				? process.env.VERCEL_URL
				: undefined
		: undefined;

export const auth = betterAuth({
	appName: siteConfig.auth.appName,
	baseURL,
	secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "fallback-secret-change-in-production",
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailVerification: {
		async sendVerificationEmail({ user, url }) {
			const res = await resend.emails.send({
				from,
				to: to || user.email,
				subject: "Verify your email address",
				html: `<a href="${url}">Verify your email address</a>`,
			});
			console.log(res, user.email);
		},
	},
	account: {
		accountLinking: {
			trustedProviders: ["google", "github", "demo-app"],
		},
	},
	emailAndPassword: {
		enabled: true,
		async sendResetPassword({ user, url }) {
			await resend.emails.send({
				from,
				to: user.email,
				subject: "Reset your password",
				react: reactResetPasswordEmail({
					username: user.email,
					resetLink: url,
				}),
			});
		},
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID || "",
			clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
			scope: ["user:email", "read:user"],
		},
		google: {
			clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		},

	},
	plugins: [
		organization({
			async sendInvitationEmail(data) {
				await resend.emails.send({
					from,
					to: data.email,
					subject: "You've been invited to join an organization",
					react: reactInvitationEmail({
						username: data.email,
						invitedByUsername: data.inviter.user.name,
						invitedByEmail: data.inviter.user.email,
						teamName: data.organization.name,
						inviteLink:
							process.env.NODE_ENV === "development"
								? `http://localhost:3000/accept-invitation/${data.id}`
								: `${process.env.BETTER_AUTH_URL || siteConfig.url}/accept-invitation/${data.id}`,
					}),
				});
			},
		}),
		twoFactor({
			otpOptions: {
				async sendOTP({ user, otp }) {
					await resend.emails.send({
						from,
						to: user.email,
						subject: "Your OTP",
						html: `Your OTP is ${otp}`,
					});
				},
			},
		}),
		passkey(),
		openAPI(),
		bearer(),
		admin({
			adminUserIds: [], // Add your admin user IDs here
		}),
		multiSession(),
		oAuthProxy(),
		nextCookies(),
		oneTap(),
		customSession(async (session) => {
			return session;
		}),


		deviceAuthorization({
			expiresIn: "3min",
			interval: "5s",
		}),
		lastLoginMethod(),
	],
	trustedOrigins: ["exp://"],
	advanced: {
		crossSubDomainCookies: {
			enabled: process.env.NODE_ENV === "production",
			domain: cookieDomain,
		},
	},
});
