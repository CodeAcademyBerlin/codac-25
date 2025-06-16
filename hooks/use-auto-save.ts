import { useCallback, useEffect, useRef, useState } from 'react';
import { type Value } from 'platejs';
import { useDebounce } from './use-debounce';
import { useLocalStorage } from './use-local-storage';

interface UseAutoSaveOptions {
    documentId: string;
    onSave: (content: Value) => Promise<{ success: boolean; error?: string }>;
    debounceMs?: number;
    autoSaveIntervalMs?: number;
}

export interface AutoSaveStatus {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved?: Date;
    error?: string;
    hasUnsavedChanges: boolean;
}

export function useAutoSave({
    documentId,
    onSave,
    debounceMs = 1000,
    autoSaveIntervalMs = 30000, // 30 seconds
}: UseAutoSaveOptions) {
    const [content, setContent] = useState<Value | null>(null);
    const [status, setStatus] = useState<AutoSaveStatus>({
        status: 'idle',
        hasUnsavedChanges: false,
    });

    // Store draft in localStorage with document-specific key
    const [localDraft, setLocalDraft, removeLocalDraft] = useLocalStorage<{
        content: Value;
        timestamp: number;
        documentId: string;
    } | null>(`doc_draft_${documentId}`, null);

    // Debounce content changes for local storage
    const debouncedContent = useDebounce(content, debounceMs);

    // Refs for managing intervals and preventing stale closures
    const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const autoSaveIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const lastSavedContentRef = useRef<Value | null>(null);

    // Save to local storage when content changes (debounced)
    useEffect(() => {
        if (debouncedContent && content) {
            setLocalDraft({
                content: debouncedContent,
                timestamp: Date.now(),
                documentId,
            });

            setStatus((prev) => ({
                ...prev,
                hasUnsavedChanges: true,
            }));
        }
    }, [debouncedContent, documentId, setLocalDraft, content]);

    // Function to save to database
    const saveToDatabase = useCallback(async (contentToSave: Value) => {
        if (!contentToSave) return;

        setStatus((prev) => ({ ...prev, status: 'saving' }));

        try {
            const result = await onSave(contentToSave);

            if (result.success) {
                lastSavedContentRef.current = contentToSave;
                removeLocalDraft(); // Clear local draft after successful save
                setStatus({
                    status: 'saved',
                    lastSaved: new Date(),
                    hasUnsavedChanges: false,
                });
            } else {
                setStatus((prev) => ({
                    ...prev,
                    status: 'error',
                    error: result.error || 'Failed to save',
                }));
            }
        } catch (error) {
            console.error('Auto-save error:', error);
            setStatus(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            }));
        }
    }, [onSave, removeLocalDraft]);

    // Manual save function
    const save = useCallback(async () => {
        if (content) {
            await saveToDatabase(content);
        }
    }, [content, saveToDatabase]);

    // Update content function
    const updateContent = useCallback((newContent: Value) => {
        setContent(newContent);

        // Clear any existing save timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new save timeout for database persistence
        saveTimeoutRef.current = setTimeout(() => {
            saveToDatabase(newContent);
        }, debounceMs * 2); // Save to DB after 2x the local storage debounce
    }, [saveToDatabase, debounceMs]);

    // Auto-save interval for periodic database syncing
    useEffect(() => {
        autoSaveIntervalRef.current = setInterval(() => {
            if (content && status.hasUnsavedChanges) {
                saveToDatabase(content);
            }
        }, autoSaveIntervalMs);

        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [content, status.hasUnsavedChanges, saveToDatabase, autoSaveIntervalMs]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, []);

    // Check for local draft on mount
    const checkForLocalDraft = useCallback(() => {
        if (localDraft && localDraft.documentId === documentId) {
            return {
                hasLocalDraft: true,
                draft: localDraft.content,
                timestamp: new Date(localDraft.timestamp),
            };
        }
        return { hasLocalDraft: false, draft: null, timestamp: undefined };
    }, [localDraft, documentId]);

    // Restore from local draft
    const restoreFromLocalDraft = useCallback(() => {
        if (localDraft && localDraft.documentId === documentId) {
            setContent(localDraft.content);
            setStatus((prev) => ({
                ...prev,
                hasUnsavedChanges: true,
            }));
        }
    }, [localDraft, documentId]);

    // Discard local draft
    const discardLocalDraft = useCallback(() => {
        removeLocalDraft();
        setStatus((prev) => ({
            ...prev,
            hasUnsavedChanges: false,
        }));
    }, [removeLocalDraft]);

    return {
        updateContent,
        save,
        status,
        checkForLocalDraft,
        restoreFromLocalDraft,
        discardLocalDraft,
    };
} 