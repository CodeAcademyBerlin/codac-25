'use client';

import Link from 'next/link';
import { FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { createDoc } from '@/actions/doc/create-doc';

interface Document {
    id: string;
    title: string;
}

interface DocSidebarProps {
    docs: Document[];
}

export function DocSidebarContent({ docs }: DocSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleCreateNewDocument = async () => {
        const newDoc = await createDoc({
            title: 'New Document',
            parentId: 'root',
        });
        console.log(newDoc);
    }

    return (
        <aside className={cn(
            "border-r bg-sidebar flex flex-col h-full transition-all duration-200",
            isCollapsed ? "w-16" : "w-64"
        )}>
            <div className="p-4 border-b flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex-1 mr-2">
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
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {!isCollapsed && (
                <div className="p-2 border-b">
                    <Button onClick={handleCreateNewDocument}
                        size="sm" variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        New Doc
                    </Button>
                </div>
            )}

            <ScrollArea className="flex-1">
                <div className="p-2">
                    <nav className="space-y-1">
                        {docs.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/docs/${doc.id}`}
                                className={cn(
                                    "flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors group",
                                    isCollapsed ? "justify-center" : "gap-3"
                                )}
                                title={isCollapsed ? doc.title : undefined}
                            >
                                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                                {!isCollapsed && <span className="truncate">{doc.title}</span>}
                            </Link>
                        ))}

                        {docs.length === 0 && !isCollapsed && (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    No documents yet
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Create your first document to get started
                                </p>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Document
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            </ScrollArea>

            {!isCollapsed && (
                <div className="p-4 border-t">
                    <div className="text-xs text-muted-foreground">
                        {docs.length} {docs.length === 1 ? 'document' : 'documents'}
                    </div>
                </div>
            )}
        </aside>
    );
} 