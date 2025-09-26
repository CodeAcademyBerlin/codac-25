'use client';

import { SaveIcon, CheckIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';
import { useEditorRef, usePluginOption } from 'platejs/react';
import * as React from 'react';

import { savePlugin } from '@/components/editor/plugins/save-kit';

import { ToolbarButton } from './toolbar';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SimpleSaveButtonProps
  extends React.ComponentProps<typeof ToolbarButton> {
  documentId?: string; // Optional, will get from plugin options if not provided
  onSave?: (content: unknown) => void;
}

/**
 * Simple save button that doesn't rely on plugin selectors to avoid SSR issues
 */
export function SimpleSaveButton({
  documentId: propDocumentId,
  onSave,
  ...props
}: SimpleSaveButtonProps) {
  const editor = useEditorRef();
  const [saveState, setSaveState] = React.useState<SaveState>('idle');
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  // Get documentId from plugin options if not provided as prop
  const pluginDocumentId = usePluginOption(savePlugin, 'documentId') ?? '';
  const documentId = propDocumentId || pluginDocumentId;

  const handleSave = React.useCallback(async () => {
    if (!editor || !documentId) return;

    setSaveState('saving');

    try {
      const result = await editor.api.save.save();

      if (result.success) {
        setSaveState('saved');
        setLastSaved(new Date());

        // Call the optional onSave callback
        if (onSave) {
          onSave(editor.children);
        }

        // Reset to idle after 2 seconds
        setTimeout(() => setSaveState('idle'), 2000);
      } else {
        setSaveState('error');
        setTimeout(() => setSaveState('idle'), 3000);
      }
    } catch (error) {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }, [editor, documentId, onSave]);

  // Don't render during SSR if editor is not available
  if (!editor) {
    return null;
  }

  const getTooltip = () => {
    switch (saveState) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved
          ? `Saved at ${lastSaved.toLocaleTimeString()}`
          : 'Saved';
      case 'error':
        return 'Save failed - click to retry';
      default:
        return 'Save document (Ctrl+S)';
    }
  };

  const getIcon = () => {
    switch (saveState) {
      case 'saving':
        return <ClockIcon className='animate-spin' />;
      case 'saved':
        return <CheckIcon className='text-green-600' />;
      case 'error':
        return <AlertCircleIcon className='text-red-600' />;
      default:
        return <SaveIcon />;
    }
  };

  return (
    <ToolbarButton
      {...props}
      onClick={handleSave}
      disabled={saveState === 'saving' || !documentId}
      tooltip={getTooltip()}
    >
      {getIcon()}
    </ToolbarButton>
  );
}
