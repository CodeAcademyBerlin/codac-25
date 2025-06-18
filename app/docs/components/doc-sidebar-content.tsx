'use client';

import { FileText, Plus, FolderPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { createDoc } from '@/actions/doc/create-doc';
import * as SettingsBar from '@/components/settings-bar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

import { CollapsedSidebarIcons } from './collapsed-sidebar-icons';
import { EditableToc } from './editable-toc';

interface TreeNode {
    id: string;
    title: string;
    type: 'FOLDER' | 'DOCUMENT';
    parentId?: string;
    children?: TreeNode[];
    isExpanded?: boolean;
}

interface DocSidebarProps {
    nodes: TreeNode[];
}

export function DocSidebarContent({ nodes: initialNodes }: DocSidebarProps) {
    const [nodes, setNodes] = useState<TreeNode[]>(initialNodes);
    const router = useRouter();
    
    // Update nodes when initialNodes changes
    useEffect(() => {
        setNodes(initialNodes);
    }, [initialNodes]);

    const handleCreateNewDocument = async () => {
        const newDoc = await createDoc({
            title: 'New Document',
            isFolder: false,
            type: 'GENERAL'
        });
        if (newDoc.success && newDoc.data) {
            router.push(`/docs/${newDoc.data.id}`);
        }
    };

    const handleCreateNewFolder = async () => {
        const newFolder = await createDoc({
            title: 'New Folder',
            isFolder: true,
            type: 'GENERAL',
            content: [] // Empty content for folders
        });
        if (newFolder.success && newFolder.data) {
            // Add the new folder to the local state
            const newNode: TreeNode = {
                id: newFolder.data.id,
                title: newFolder.data.title,
                type: 'FOLDER',
                children: [],
                isExpanded: false
            };
            setNodes(prev => [...prev, newNode]);
        }
    };

    const totalDocuments = (nodes: TreeNode[]): number => {
        return nodes.reduce((count, node) => {
            let nodeCount = node.type === 'DOCUMENT' ? 1 : 0;
            if (node.children) {
                nodeCount += totalDocuments(node.children);
            }
            return count + nodeCount;
        }, 0);
    };

    const docCount = totalDocuments(nodes);

    return (
        <SettingsBar.Root collapsedContent={<CollapsedSidebarIcons nodes={nodes} />}>
            <SettingsBar.Item 
                title="Documents" 
                action={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm" 
                                variant="outline"
                                className="h-7 px-2"
                                aria-label="Create new item"
                            >
                                <Plus className="h-3 w-3" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleCreateNewDocument}>
                                <FileText className="h-4 w-4 mr-2" />
                                New Document
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCreateNewFolder}>
                                <FolderPlus className="h-4 w-4 mr-2" />
                                New Folder
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            >
                <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="space-y-1">
                        {nodes.length > 0 ? (
                            <EditableToc 
                                nodes={nodes} 
                                onNodesChange={setNodes}
                            />
                        ) : (
                            <div className="text-center py-8" role="status" aria-live="polite">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    No documents yet
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Create your first document to get started
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button size="sm" onClick={handleCreateNewDocument}>
                                        <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                                        Document
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleCreateNewFolder}>
                                        <FolderPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                                        Folder
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SettingsBar.Item>

            <SettingsBar.Item title="Statistics">
                <div className="text-xs text-muted-foreground" role="status" aria-live="polite">
                    {docCount} {docCount === 1 ? 'document' : 'documents'}
                </div>
            </SettingsBar.Item>
        </SettingsBar.Root>
    );
} 