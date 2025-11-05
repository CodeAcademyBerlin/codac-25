import {
	adminClient,
	deviceAuthorizationClient,
	genericOAuthClient,
	lastLoginMethodClient,
	multiSessionClient,
	oidcClient,
	oneTapClient,
	organizationClient,
	passkeyClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

export const client = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	plugins: [
		organizationClient(),
		twoFactorClient({
			onTwoFactorRedirect() {
				window.location.href = "/two-factor";
			},
		}),
		passkeyClient(),
		adminClient(),
		multiSessionClient(),
		...(process.env.NODE_ENV === "production"
			? [
					oneTapClient({
						clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
						promptOptions: {
							maxAttempts: 1,
						},
					}),
				]
			: []),
		oidcClient(),
		genericOAuthClient(),

		deviceAuthorizationClient(),
		lastLoginMethodClient(),
	],
	fetchOptions: {
		onError(e) {
			if (e.error.status === 429) {
				toast.error("Too many requests. Please try again later.");
			}
		},
	},
});

export const {
	signUp,
	signIn,
	signOut,
	useSession,
	organization,
	useListOrganizations,
	useActiveOrganization,
	useActiveMember,
	useActiveMemberRole,
} = client;
