'use client';

import Link from 'next/link';
import { FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { createDoc } from '@/actions/doc/create-doc';
import { useRouter } from 'next/navigation';

interface Document {
    id: string;
    title: string;
}

interface DocSidebarProps {
    docs: Document[];
}

export function DocSidebarContent({ docs }: DocSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter();
    const handleCreateNewDocument = async () => {
        const newDoc = await createDoc({
            title: 'New Document',
            type: 'GENERAL'
        });
        if (newDoc.success && newDoc.data) {
            router.push(`/docs/${newDoc.data.id}`);
        }
    }

    return (
        <aside
            className={cn(
                "w-full border-r bg-sidebar flex flex-col h-full transition-all duration-300 ease-in-out",
                isCollapsed ? "w-16" : "w-56"
            )}
            role="complementary"
            aria-label="Document navigation"
        >
            <div className="p-4 border-b flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex-1 mr-2 animate-in slide-in-from-left-translate-full duration-200 delay-100 ease-in-out">
                        <h2 className="text-lg font-semibold text-foreground">Documents</h2>
                        <p className="text-xs text-muted-foreground">
                            Manage your learning documents
                        </p>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 w-8 p-0"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-expanded={!isCollapsed}
                    aria-controls="docs-navigation"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {!isCollapsed && (
                <div className="p-2 border-b">
                    <Button onClick={handleCreateNewDocument}
                        size="sm" variant="outline" className="w-full"
                        aria-label="Create new document"
                    >
                        <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                        New Doc
                    </Button>
                </div>
            )}

            <ScrollArea className="flex-1">
                <div className="p-2">
                    <nav
                        className="space-y-1"
                        id="docs-navigation"
                        role="navigation"
                        aria-label="Document list"
                    >
                        {docs.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/docs/${doc.id}`}
                                className={cn(
                                    "flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    isCollapsed ? "justify-center" : "gap-3"
                                )}
                                title={isCollapsed ? doc.title : undefined}
                                aria-label={isCollapsed ? `Open document: ${doc.title}` : undefined}
                            >
                                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" aria-hidden="true" />
                                {!isCollapsed && <span className="truncate">{doc.title}</span>}
                            </Link>
                        ))}

                        {docs.length === 0 && !isCollapsed && (
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
            {!isCollapsed && (
                <div className="p-4 border-t">
                    <div className="text-xs text-muted-foreground" role="status" aria-live="polite">
                        {docs.length} {docs.length === 1 ? 'document' : 'documents'}
                    </div>
                </div>
            )}
        </aside>
    );
} 