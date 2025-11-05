#!/usr/bin/env tsx

import { getFolderTreeWithDocuments } from '../data/documents/get-folders';

async function testFolderTree() {
    try {
        console.log('Testing LMS folder tree...');

        const result = await getFolderTreeWithDocuments();

        console.log(`Root IDs: ${result.rootIds.length}`);
        console.log(`Total items: ${Object.keys(result.items).length}`);

        // Show the structure
        function printTree(itemId: string, level = 0) {
            const item = result.items[itemId];
            if (!item) return;

            const indent = '  '.repeat(level);
            const type = item.type === 'folder' ? '📁' : '📄';
            const count = item.documentCount ? ` (${item.documentCount})` : '';
            console.log(`${indent}${type} ${item.name}${count}`);

            if (item.children && item.children.length > 0) {
                item.children.forEach((childId: string) => {
                    printTree(childId, level + 1);
                });
            }
        }

        console.log('\nTree structure:');
        result.rootIds.forEach((rootId: string) => {
            printTree(rootId);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

testFolderTree();
