import { requireServerAnyRole } from '@/lib/auth/auth-server';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireServerAnyRole(['ADMIN', 'MENTOR']);

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b">
                <div className="flex h-16 items-center px-4">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold">LMS Administration</h1>
                        <div className="text-sm text-muted-foreground">
                            Logged in as {user.name} ({user.role})
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto py-6">
                {children}
            </div>
        </div>
    );
} 