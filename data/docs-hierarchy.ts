import { prisma } from "@/lib/db";
import { cache } from 'react';

interface TreeNode {
    id: string;
    title: string;
    type: 'FOLDER' | 'DOCUMENT';
    parentId?: string;
    children?: TreeNode[];
    isExpanded?: boolean;
}

// Transform database documents into tree structure
function buildTree(documents: any[]): TreeNode[] {
    const nodeMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // First pass: create all nodes
    documents.forEach(doc => {
        const node: TreeNode = {
            id: doc.id,
            title: doc.title,
            type: doc.isFolder ? 'FOLDER' : 'DOCUMENT',
            parentId: doc.parentId || undefined,
            children: [],
            isExpanded: false
        };
        nodeMap.set(doc.id, node);
    });

    // Second pass: build the tree
    documents.forEach(doc => {
        const node = nodeMap.get(doc.id);
        if (!node) return;

        if (doc.parentId) {
            const parent = nodeMap.get(doc.parentId);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(node);
            } else {
                // Parent not found, treat as root
                rootNodes.push(node);
            }
        } else {
            rootNodes.push(node);
        }
    });

    // Sort children recursively
    const sortChildren = (nodes: TreeNode[]): TreeNode[] => {
        return nodes
            .sort((a, b) => {
                // Folders first, then documents
                if (a.type === 'FOLDER' && b.type === 'DOCUMENT') return -1;
                if (a.type === 'DOCUMENT' && b.type === 'FOLDER') return 1;
                // Then alphabetically by title
                return a.title.localeCompare(b.title);
            })
            .map(node => ({
                ...node,
                children: node.children ? sortChildren(node.children) : undefined
            }));
    };

    return sortChildren(rootNodes);
}

export const getDocsHierarchy = cache(async (type?: string): Promise<TreeNode[]> => {
    const docs = await prisma.document.findMany({
        where: type && type !== 'ALL' ? { type: type as any } : undefined,
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: [
            { createdAt: 'desc' }
        ],
    });

    return buildTree(docs);
});

// Helper function to detect if a document should be treated as a folder
export const isFolder = (doc: any): boolean => {
    return doc.isFolder === true;
};

// Create a folder (document with isFolder flag)
export const createFolder = async (title: string, parentId?: string) => {
    return prisma.document.create({
        data: {
            title,
            content: [], // Empty content for folders
            parentId,
            isFolder: true,
            type: 'GENERAL',
            authorId: 'demo-user', // TODO: Replace with actual user ID
            isPublished: false,
            isArchived: false,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}; 