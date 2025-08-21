import { Metadata } from "next";
import { ReactNode } from "react";

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

      {children}
    </div>
  );
}
