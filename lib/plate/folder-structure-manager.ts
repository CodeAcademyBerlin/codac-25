import { PrismaClient } from '@prisma/client';

import { logger } from '@/lib/logger';

export interface FolderStructure {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    parentId?: string;
    sortOrder: number;
    children: FolderStructure[];
    documentCount: number;
}

export interface LMSFolderMapping {
    [folderPath: string]: {
        id: string;
        name: string;
        parentId?: string;
    };
}

/**
 * Manages document folder structure for LMS content
 */
export class FolderStructureManager {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Create or get folder structure for LMS content
     */
    async createLMSFolderStructure(
        authorId: string,
        folderStructure: Record<string, any[]>
    ): Promise<LMSFolderMapping> {
        const folderMapping: LMSFolderMapping = {};
        const rootFolderId = await this.ensureRootFolder(authorId);

        // Create folders for each module/category
        for (const [folderName, files] of Object.entries(folderStructure)) {
            const folderId = await this.createOrGetFolder({
                name: this.formatFolderName(folderName),
                description: this.getFolderDescription(folderName),
                color: this.getFolderColor(folderName),
                icon: this.getFolderIcon(folderName),
                parentId: rootFolderId,
                ownerId: authorId,
                sortOrder: this.getFolderSortOrder(folderName),
            });

            folderMapping[folderName] = {
                id: folderId,
                name: this.formatFolderName(folderName),
                parentId: rootFolderId,
            };

            // Create subfolders if needed
            const subfolders = this.extractSubfolders(files);
            for (const [subfolderName, _subfolderFiles] of Object.entries(subfolders)) {
                const subfolderId = await this.createOrGetFolder({
                    name: this.formatFolderName(subfolderName),
                    description: `Content for ${subfolderName}`,
                    color: this.getSubfolderColor(folderName),
                    icon: this.getSubfolderIcon(subfolderName),
                    parentId: folderId,
                    ownerId: authorId,
                    sortOrder: this.getSubfolderSortOrder(subfolderName),
                });

                const subfolderPath = `${folderName}/${subfolderName}`;
                folderMapping[subfolderPath] = {
                    id: subfolderId,
                    name: this.formatFolderName(subfolderName),
                    parentId: folderId,
                };
            }
        }

        return folderMapping;
    }

    /**
     * Ensure root LMS folder exists
     */
    private async ensureRootFolder(authorId: string): Promise<string> {
        const existingRoot = await this.prisma.documentFolder.findFirst({
            where: {
                name: 'LMS Content',
                ownerId: authorId,
                parentId: null,
            },
        });

        if (existingRoot) {
            return existingRoot.id;
        }

        const rootFolder = await this.prisma.documentFolder.create({
            data: {
                name: 'LMS Content',
                description: 'Learning Management System content and materials',
                color: '#3B82F6',
                icon: 'book-open',
                ownerId: authorId,
                sortOrder: 0,
            },
        });

        logger.info('Created root LMS folder', {
            action: 'create_root_lms_folder',
            metadata: { folderId: rootFolder.id, authorId },
        });

        return rootFolder.id;
    }

    /**
     * Create or get a folder
     */
    private async createOrGetFolder(data: {
        name: string;
        description?: string;
        color: string;
        icon?: string;
        parentId?: string;
        ownerId: string;
        sortOrder: number;
    }): Promise<string> {
        const existing = await this.prisma.documentFolder.findFirst({
            where: {
                name: data.name,
                ownerId: data.ownerId,
                parentId: data.parentId || null,
            },
        });

        if (existing) {
            return existing.id;
        }

        const folder = await this.prisma.documentFolder.create({
            data,
        });

        logger.info('Created LMS folder', {
            action: 'create_lms_folder',
            metadata: { folderId: folder.id, name: data.name, parentId: data.parentId },
        });

        return folder.id;
    }

    /**
     * Extract subfolders from file structure
     */
    private extractSubfolders(files: any[]): Record<string, any[]> {
        const subfolders: Record<string, any[]> = {};

        for (const file of files) {
            if (file.folderPath && file.folderPath !== file.folderName) {
                const subfolderName = file.folderPath.split('/').pop();
                if (subfolderName && subfolderName !== file.folderName) {
                    if (!subfolders[subfolderName]) {
                        subfolders[subfolderName] = [];
                    }
                    subfolders[subfolderName].push(file);
                }
            }
        }

        return subfolders;
    }

    /**
     * Format folder name for display
     */
    private formatFolderName(name: string): string {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get folder description based on name
     */
    private getFolderDescription(name: string): string {
        const descriptions: Record<string, string> = {
            career: 'Career development and job search resources',
            data: 'Data science and analytics content',
            web: 'Web development and programming materials',
            welcome: 'Welcome and introduction content',
            guidelines: 'Guidelines and best practices',
        };

        return descriptions[name] || `Content for ${this.formatFolderName(name)}`;
    }

    /**
     * Get folder color based on name
     */
    private getFolderColor(name: string): string {
        const colors: Record<string, string> = {
            career: '#10B981', // Green
            data: '#8B5CF6',   // Purple
            web: '#F59E0B',    // Amber
            welcome: '#3B82F6', // Blue
            guidelines: '#EF4444', // Red
        };

        return colors[name] || '#6B7280'; // Gray
    }

    /**
     * Get folder icon based on name
     */
    private getFolderIcon(name: string): string {
        const icons: Record<string, string> = {
            career: 'briefcase',
            data: 'chart-bar',
            web: 'code',
            welcome: 'hand-wave',
            guidelines: 'clipboard-list',
        };

        return icons[name] || 'folder';
    }

    /**
     * Get subfolder color based on parent folder
     */
    private getSubfolderColor(parentFolder: string): string {
        const baseColor = this.getFolderColor(parentFolder);
        // Lighten the color for subfolders
        return this.lightenColor(baseColor, 20);
    }

    /**
     * Get subfolder icon
     */
    private getSubfolderIcon(_name: string): string {
        return 'folder-open';
    }

    /**
     * Get folder sort order
     */
    private getFolderSortOrder(name: string): number {
        const order: Record<string, number> = {
            welcome: 0,
            guidelines: 1,
            web: 2,
            data: 3,
            career: 4,
        };

        return order[name] || 99;
    }

    /**
     * Get subfolder sort order
     */
    private getSubfolderSortOrder(name: string): number {
        // Simple alphabetical ordering for subfolders
        return name.charCodeAt(0);
    }

    /**
     * Lighten a hex color
     */
    private lightenColor(hex: string, percent: number): string {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    /**
     * Get folder ID for a document based on its path
     */
    getFolderIdForDocument(
        filePath: string,
        folderMapping: LMSFolderMapping
    ): string | null {
        const parts = filePath.split('/');

        if (parts.length === 1) {
            // Root level document
            return null;
        }

        if (parts.length === 2) {
            // Direct folder document
            const folderName = parts[0];
            return folderMapping[folderName]?.id || null;
        }

        if (parts.length > 2) {
            // Subfolder document
            const folderPath = parts.slice(0, -1).join('/');
            return folderMapping[folderPath]?.id || null;
        }

        return null;
    }

    /**
     * Clean up LMS folders (remove empty folders)
     */
    async cleanupEmptyFolders(authorId: string): Promise<void> {
        const folders = await this.prisma.documentFolder.findMany({
            where: {
                ownerId: authorId,
                name: {
                    not: 'LMS Content', // Don't delete root folder
                },
            },
            include: {
                documents: true,
                children: true,
            },
        });

        for (const folder of folders) {
            if (folder.documents.length === 0 && folder.children.length === 0) {
                await this.prisma.documentFolder.delete({
                    where: { id: folder.id },
                });

                logger.info('Deleted empty LMS folder', {
                    action: 'delete_empty_lms_folder',
                    metadata: { folderId: folder.id, name: folder.name },
                });
            }
        }
    }
}
