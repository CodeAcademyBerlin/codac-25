import { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentorship",
  description: "Connect with mentors and get guidance on your learning journey",
};

export default function MentorshipLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <GraduationCap className="mr-2 h-8 w-8" />
          Mentorship
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect with mentors to accelerate your learning journey
        </p>
      </div>
      {children}
    </div>
  );
}
