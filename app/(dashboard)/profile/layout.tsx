import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        template: '%s | Profile',
        default: 'Profile',
    },
    description: 'Manage your profile and account settings',
};

export default function ProfileLayout({
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