import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/auth-utils';

import { RAGAdminPanel } from './components/rag-admin-panel';

export default async function RAGAdminPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/signin');
    }

    if (!['ADMIN', 'MENTOR'].includes(user.role)) {
        redirect('/lms');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">RAG System Management</h1>
                <p className="text-muted-foreground">
                    Manage content indexing and RAG system configuration
                </p>
            </div>

            <RAGAdminPanel />
        </div>
    );
}
