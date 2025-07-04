"use client"

interface SaveStatus {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved?: Date;
    error?: string;
    hasUnsavedChanges: boolean;
}

// Legacy save interface - kept for compatibility

export const useSave = (): { triggerSave: () => Promise<void>; saveStatus: SaveStatus } => {
    // Fallback hook for components that still import from this file
    // The actual save functionality is now in UnifiedEditor
    return {
        triggerSave: async () => {
            console.warn('Save context not available - save operation skipped');
        },
        saveStatus: {
            status: 'idle' as const,
            hasUnsavedChanges: false,
        }
    };
};