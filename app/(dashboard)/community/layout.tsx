import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community | CODAC',
    description: 'Connect with your peers, explore cohorts, and be part of our growing community.',
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
} 