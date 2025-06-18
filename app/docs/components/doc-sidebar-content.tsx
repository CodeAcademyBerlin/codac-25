'use client';

import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { createDoc } from '@/actions/doc/create-doc';
import * as SettingsBar from '@/components/settings-bar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Document {
    id: string;
    title: string;
}

interface DocSidebarProps {
    docs: Document[];
}

export function DocSidebarContent({ docs }: DocSidebarProps) {
    const router = useRouter();
    
    const handleCreateNewDocument = async () => {
        const newDoc = await createDoc({
            title: 'New Document',
            type: 'GENERAL'
        });
        if (newDoc.success && newDoc.data) {
            router.push(`/docs/${newDoc.data.id}`);
        }
    };

    return (
        <SettingsBar.Root>
            <SettingsBar.Item 
                title="Documents" 
                action={
                    <Button
                        onClick={handleCreateNewDocument}
                        size="sm" 
                        variant="outline"
                        className="h-7 px-2"
                        aria-label="Create new document"
                    >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                    </Button>
                }
            >
                <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="space-y-1">
                        <nav
                            className="space-y-1"
                            role="navigation"
                            aria-label="Document list"
                        >
                            {docs.map((doc) => (
                                <Link
                                    key={doc.id}
                                    href={`/docs/${doc.id}`}
                                    className={cn(
                                        "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    )}
                                    aria-label={`Open document: ${doc.title}`}
                                >
                                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" aria-hidden="true" />
                                    <span className="truncate">{doc.title}</span>
                                </Link>
                            ))}

                            {docs.length === 0 && (
                                <div className="text-center py-8" role="status" aria-live="polite">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        No documents yet
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Create your first document to get started
                                    </p>
                                    <Button size="sm" onClick={handleCreateNewDocument}>
                                        <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                                        Create Document
                                    </Button>
                                </div>
                            )}
                        </nav>
                    </div>
                </ScrollArea>
            </SettingsBar.Item>

            <SettingsBar.Item title="Statistics">
                <div className="text-xs text-muted-foreground" role="status" aria-live="polite">
                    {docs.length} {docs.length === 1 ? 'document' : 'documents'}
                </div>
            </SettingsBar.Item>
        </SettingsBar.Root>
    );
} 