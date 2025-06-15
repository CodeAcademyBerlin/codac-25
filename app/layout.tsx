import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { Providers } from "@/components/providers";
import { SidebarInset } from "@/components/ui/sidebar";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CODAC - Code Academy Berlin Learning Platform",
  description: "Comprehensive learning management system and community platform for Code Academy Berlin students and alumni. Learn, collaborate, and grow together.",
  keywords: ["Code Academy Berlin", "LMS", "Learning Platform", "Web Development", "Data Science", "UX/UI Design", "Bootcamp", "Programming Education"],
  authors: [{ name: "Code Academy Berlin" }],
  creator: "Code Academy Berlin",
  openGraph: {
    title: "CODAC - Code Academy Berlin Learning Platform",
    description: "Comprehensive learning management system and community platform for Code Academy Berlin students and alumni.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CODAC - Code Academy Berlin Learning Platform",
    description: "Learn, collaborate, and grow with Code Academy Berlin's comprehensive learning platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NuqsAdapter>
          <Providers>
            {children}
          </Providers>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  );
}
