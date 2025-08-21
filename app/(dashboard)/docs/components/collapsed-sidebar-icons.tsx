'use client';

import { FileText, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface TreeNode {
    id: string;
    title: string;
    type: 'FOLDER' | 'DOCUMENT';
    parentId?: string;
    children?: TreeNode[];
    isExpanded?: boolean;
}

interface CollapsedSidebarIconsProps {
    nodes: TreeNode[];
}

export function CollapsedSidebarIcons({ nodes }: CollapsedSidebarIconsProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Consider collapsed if width is less than 100px (indicating the sidebar is collapsed)
                setIsCollapsed(entry.contentRect.width < 100);
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const renderNodeIcons = (nodes: TreeNode[]): React.ReactNode[] => {
        return nodes.flatMap((node) => {
            const nodeIcon = (
                <Tooltip key={node.id}>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 mb-1"
                            onClick={() => {
                                if (node.type === 'DOCUMENT') {
                                    router.push(`/docs/${node.id}`);
                                }
                            }}
                        >
                            {node.type === 'FOLDER' ? (
                                <Folder className="h-4 w-4 text-blue-500" />
                            ) : (
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>
                            {node.type === 'FOLDER' 
                                ? `Folder: ${node.title}${node.children?.length ? ` (${node.children.length} items)` : ' (empty)'}`
                                : `Document: ${node.title}`
                            }
                        </p>
                    </TooltipContent>
                </Tooltip>
            );
            
            // Include children if it's a folder
            const childIcons = node.children ? renderNodeIcons(node.children) : [];
            return [nodeIcon, ...childIcons];
        });
    };

    return (
        <div ref={containerRef} className="w-full">
            {isCollapsed && (
                <TooltipProvider>
                    <div className="flex flex-col items-center space-y-1 py-2">
                        {renderNodeIcons(nodes)}
                    </div>
                </TooltipProvider>
            )}
        </div>
    );
} 