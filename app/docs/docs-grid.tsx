import { formatDistanceToNow } from 'date-fns';
import { FileText, BookOpen, ClipboardList, FolderOpen } from "lucide-react";
import Link from 'next/link';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DOCUMENT_TYPE_CONFIG = {
    GENERAL: {
        label: 'General',
        icon: FileText,
        variant: 'default' as const,
    },
    COURSE_MATERIAL: {
        label: 'Course Material',
        icon: BookOpen,
        variant: 'secondary' as const,
    },
    ASSIGNMENT: {
        label: 'Assignment',
        icon: ClipboardList,
        variant: 'destructive' as const,
    },
    RESOURCE: {
        label: 'Resource',
        icon: FolderOpen,
        variant: 'outline' as const,
    },
};

type Doc = {
    id: string;
    title: string;
    type: keyof typeof DOCUMENT_TYPE_CONFIG;
    createdAt: Date;
    updatedAt: Date;
    isPublished: boolean;
    author?: {
        name: string | null;
        email: string;
    };
};

interface DocsGridProps {
    docs: Doc[];
    selectedType?: string;
}

export function DocsGrid({ docs, selectedType }: DocsGridProps) {
    const typeLabel = selectedType && selectedType !== 'ALL'
        ? DOCUMENT_TYPE_CONFIG[selectedType as keyof typeof DOCUMENT_TYPE_CONFIG]?.label
        : 'All';

    if (docs.length === 0) {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-[400px] text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No documents found</h2>
                <p className="text-muted-foreground mb-4">
                    {selectedType && selectedType !== 'ALL'
                        ? `No ${typeLabel?.toLowerCase()} documents are available.`
                        : 'No documents are available yet.'
                    }
                </p>
                <Link
                    href="/docs/new"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    Create Document
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    {typeLabel} Documents
                </h1>
                <p className="text-muted-foreground mt-2">
                    {docs.length} document{docs.length === 1 ? '' : 's'} found
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {docs.map((doc) => {
                    const typeConfig = DOCUMENT_TYPE_CONFIG[doc.type];
                    const Icon = typeConfig.icon;

                    return (
                        <Link key={doc.id} href={`/docs/${doc.id}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl line-clamp-2">
                                            {doc.title}
                                        </CardTitle>
                                        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {doc.author?.name || 'Unknown author'} • {' '}
                                        {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <Badge variant={typeConfig.variant}>
                                            {typeConfig.label}
                                        </Badge>
                                        {!doc.isPublished && (
                                            <Badge variant="outline" className="text-xs">
                                                Draft
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
} 