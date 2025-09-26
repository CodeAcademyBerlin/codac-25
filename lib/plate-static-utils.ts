import { createSlateEditor } from 'platejs';
import type { Value } from 'platejs';

import { BaseEditorKit } from '@/components/editor/editor-base-kit';

/**
 * Utility functions for working with static Plate editors
 */

/**
 * Creates a static editor instance for rendering content
 * Useful for converting dynamic content to static HTML
 */
export function createStaticEditor(value: Value) {
    return createSlateEditor({
        plugins: BaseEditorKit,
        value,
    });
}

/**
 * Validates if content is suitable for static rendering
 */
export function validateStaticContent(content: unknown): content is Value {
    return (
        Array.isArray(content) &&
        content.length > 0 &&
        content.every(node =>
            typeof node === 'object' &&
            node !== null &&
            'type' in node &&
            'children' in node
        )
    );
}

/**
 * Sanitizes content for static rendering by removing interactive elements
 */
export function sanitizeForStatic(content: Value): Value {
    return content.map(node => {
        if (typeof node === 'object' && node !== null) {
            // Remove interactive properties that shouldn't be in static content
            const { suggestion, comment, ...sanitizedNode } = node as any;

            // Recursively sanitize children
            if ('children' in sanitizedNode && Array.isArray(sanitizedNode.children)) {
                sanitizedNode.children = sanitizeForStatic(sanitizedNode.children);
            }

            return sanitizedNode;
        }
        return node;
    });
}

/**
 * Creates a minimal static editor with only essential plugins
 */
export function createMinimalStaticEditor(value: Value) {
    // Import minimal plugins
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { BaseBasicBlocksKit } = require('@/components/editor/plugins/basic-blocks-base-kit');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { BaseBasicMarksKit } = require('@/components/editor/plugins/basic-marks-base-kit');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { BaseLinkKit } = require('@/components/editor/plugins/link-base-kit');

    const MinimalKit = [
        ...BaseBasicBlocksKit,
        ...BaseBasicMarksKit,
        ...BaseLinkKit,
    ];

    return createSlateEditor({
        plugins: MinimalKit,
        value,
    });
}

/**
 * Type guard to check if content has interactive features
 */
export function hasInteractiveFeatures(content: Value): boolean {
    return content.some(node => {
        if (typeof node === 'object' && node !== null) {
            // Check for interactive properties
            if ('suggestion' in node || 'comment' in node) {
                return true;
            }

            // Recursively check children
            if ('children' in node && Array.isArray(node.children)) {
                return hasInteractiveFeatures(node.children);
            }
        }
        return false;
    });
}

/**
 * Creates a static editor configuration based on content complexity
 */
export function createOptimalStaticEditor(value: Value) {
    // If content has interactive features, sanitize it
    const sanitizedContent = hasInteractiveFeatures(value)
        ? sanitizeForStatic(value)
        : value;

    // Use full kit for complex content, minimal for simple content
    const isComplex = sanitizedContent.some(node => {
        if (typeof node === 'object' && node !== null) {
            const type = (node as any).type;
            return ['table', 'code_block', 'media', 'callout', 'toggle'].includes(type);
        }
        return false;
    });

    return createSlateEditor({
        plugins: isComplex ? BaseEditorKit : createMinimalStaticEditor(value).plugins,
        value: sanitizedContent,
    });
}
