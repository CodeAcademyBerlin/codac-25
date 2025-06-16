'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DocsBreadcrumbProps {
    docs: Array<{
        id: string;
        title: string;
        type?: string;
    }>;
}

const DOCUMENT_TYPES = [
    { value: 'ALL', label: 'All Documents' },
    { value: 'GENERAL', label: 'General' },
    { value: 'COURSE_MATERIAL', label: 'Course Material' },
    { value: 'ASSIGNMENT', label: 'Assignment' },
    { value: 'RESOURCE', label: 'Resource' },
] as const;

export function DocsBreadcrumb({ docs }: DocsBreadcrumbProps) {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentDocId = params.id as string | undefined;
    const selectedType = searchParams.get('type') || 'ALL';

    // Find the current document
    const currentDoc = currentDocId ? docs.find(doc => doc.id === currentDocId) : null;

    const handleTypeChange = (type: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (type === 'ALL') {
            newParams.delete('type');
        } else {
            newParams.set('type', type);
        }

        const newUrl = `/docs${newParams.toString() ? `?${newParams.toString()}` : ''}`;
        router.push(newUrl);
    };

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                    <span className="text-foreground hover:text-foreground/80 font-medium">
                        Docs
                    </span>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                    <Select value={selectedType} onValueChange={handleTypeChange}>
                        <SelectTrigger className="w-[180px] h-auto p-0 border-none bg-transparent hover:bg-muted/50 focus:ring-0 focus:ring-offset-0">
                            <SelectValue asChild>
                                <span className="text-foreground hover:text-foreground/80 font-medium">
                                    {DOCUMENT_TYPES.find(type => type.value === selectedType)?.label || 'Documents'}
                                </span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {DOCUMENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </BreadcrumbItem>
                {currentDoc && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="max-w-[200px] truncate">
                                {currentDoc.title}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    );
} 