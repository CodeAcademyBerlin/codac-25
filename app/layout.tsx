import type { Metadata } from "next";
// eslint-disable-next-line camelcase
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";

import { HeaderProvider } from "@/components/header-provider";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMonoFont = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const codacBrandFont = localFont({
  src: "./codac-font.woff2",
  variable: "--font-codac-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "codac - learning community - code academy berlin ",
  description: "Comprehensive learning management system and community platform for Code Academy Berlin students and alumni. Learn, collaborate, and grow together.",
  keywords: ["Code Academy Berlin", "LMS", "Learning Platform", "Web Development", "Data Science", "UX/UI Design", "Bootcamp", "Programming Education"],
  authors: [{
    name: "Code Academy Berlin"
  }],
  creator: "Code Academy Berlin",
  icons: {
    icon: [{
      url: "/favicon.svg",
      type: "image/svg+xml"
    }],
    apple: "/apple-touch-icon.svg"
  },
  openGraph: {
    title: "codac - code academy berlin learning community",
    description: "Comprehensive learning management system and community platform for Code Academy Berlin students and alumni.",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "codac - code academy berlin learning community",
    description: "Learn, collaborate, and grow with Code Academy Berlin's comprehensive learning platform."
  },
  robots: {
    index: true,
    follow: true
  }
};
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMonoFont.variable} ${codacBrandFont.variable} antialiased `}
      >
        <Providers>
          <HeaderProvider>
            {children}
          </HeaderProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}