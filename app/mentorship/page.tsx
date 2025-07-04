"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";

export default function MentorshipIndexPage() {
  const router = useRouter();
  const [isRedirecting] = useState(true);
  const session = useSession();

  useEffect(() => {
    // Wait for session to load
    if (session.status === "loading") return;

    // Redirect based on role
    if (session.data?.user) {
      const user = session.data.user as User;

      if (user.role === "MENTOR" || user.role === "ADMIN") {
        router.push("/mentorship/sessions");
      } else {
        router.push("/mentorship/find");
      }
    } else {
      // Redirect to login if not authenticated
      router.push("/auth/signin");
    }
  }, [router, session, session.status]);

  return (
    <div className="container flex items-center justify-center h-[50vh]">
      {isRedirecting && (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">
            Redirecting to mentorship area...
          </p>
        </div>
      )}
    </div>
  );
}
