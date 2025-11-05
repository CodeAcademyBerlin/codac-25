"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import SignIn from "@/components/auth/sign-in";
import { SignUp } from "@/components/auth/sign-up";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { client } from "@/lib/auth-client";

function getCallbackURL(params: URLSearchParams): string {
	const callbackUrl = params.get("callbackUrl");
	return callbackUrl || "/dashboard";
}

export default function Page() {
	const router = useRouter();
	const params = useSearchParams();
	useEffect(() => {
		// Only enable Google One Tap in production
		if (process.env.NODE_ENV === "production") {
			client.oneTap({
				fetchOptions: {
					onError: ({ error }) => {
						toast.error(error.message || "An error occurred");
					},
					onSuccess: () => {
						toast.success("Successfully signed in");
						router.push(getCallbackURL(params));
					},
				},
			});
		}
	}, []);

	return (
		<div className="w-full">
			<div className="flex items-center flex-col justify-center w-full md:py-10">
				<div className="md:w-[400px]">
					<Tabs defaultValue="sign-in" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="sign-in">Sign In</TabsTrigger>
							<TabsTrigger value="sign-up">Sign Up</TabsTrigger>
						</TabsList>
						<TabsContent value="sign-in">
							<SignIn />
						</TabsContent>
						<TabsContent value="sign-up">
							<SignUp />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
