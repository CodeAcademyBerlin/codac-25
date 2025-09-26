'use client';

import { SaveIcon, CheckIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';
import { useEditorRef, usePluginOption } from 'platejs/react';
import * as React from 'react';

import { savePlugin } from '@/components/editor/plugins/save-kit';

import { ToolbarButton } from './toolbar';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function SaveToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();
  const [saveState, setSaveState] = React.useState<SaveState>('idle');
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  // Safely access plugin options with fallbacks
  const documentId = usePluginOption(savePlugin, 'documentId') ?? '';

  const handleSave = React.useCallback(async () => {
    if (!editor || !documentId) return;

    setSaveState('saving');

    try {
      const result = await editor.api.save.save();

      if (result.success) {
        setSaveState('saved');
        setLastSaved(new Date());

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
  }, [editor, documentId]);

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
      className={props.className}
    >
      {getIcon()}
    </ToolbarButton>
  );
}

export function SaveStateMenu(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();
  const [saveState, setSaveState] = React.useState<SaveState>('idle');
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = React.useState(true);

  // Safely access plugin options with fallbacks
  const isAutoSaveEnabledOption =
    usePluginOption(savePlugin, 'isAutoSaveEnabled') ?? true;
  const documentId = usePluginOption(savePlugin, 'documentId') ?? '';
  // const saveDelay = usePluginOption(savePlugin, 'saveDelay') ?? 2000;

  const handleSave = React.useCallback(async () => {
    if (!editor || !documentId) return;

    setSaveState('saving');

    try {
      const result = await editor.api.save.save();

      if (result.success) {
        setSaveState('saved');
        setLastSaved(new Date());
        setTimeout(() => setSaveState('idle'), 2000);
      } else {
        setSaveState('error');
        setTimeout(() => setSaveState('idle'), 3000);
      }
    } catch (error) {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }, [editor, documentId]);

  React.useEffect(() => {
    setAutoSaveEnabled(isAutoSaveEnabledOption);
  }, [isAutoSaveEnabledOption]);

  const toggleAutoSave = React.useCallback(() => {
    if (!editor) return;

    const newValue = !autoSaveEnabled;
    setAutoSaveEnabled(newValue);
    // Note: Auto-save toggle would need to be handled at the component level
    // since the plugin doesn't support boolean toggles directly
  }, [editor, autoSaveEnabled]);

  // Don't render during SSR if editor is not available
  if (!editor) {
    return null;
  }

  const getStatusText = () => {
    switch (saveState) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved
          ? `Saved at ${lastSaved.toLocaleTimeString()}`
          : 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled';
    }
  };

  const getStatusIcon = () => {
    switch (saveState) {
      case 'saving':
        return <ClockIcon className='animate-spin size-4' />;
      case 'saved':
        return <CheckIcon className='size-4 text-green-600' />;
      case 'error':
        return <AlertCircleIcon className='size-4 text-red-600' />;
      default:
        return autoSaveEnabled ? (
          <CheckIcon className='size-4 text-green-600' />
        ) : (
          <AlertCircleIcon className='size-4 text-yellow-600' />
        );
    }
  };

  return (
    <div className='flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground'>
      <div className='flex items-center gap-1'>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>

      <div className='flex items-center gap-1'>
        <ToolbarButton
          {...props}
          onClick={handleSave}
          disabled={saveState === 'saving' || !documentId}
          tooltip='Save now (Ctrl+S)'
          size='sm'
          variant='outline'
        >
          <SaveIcon className='size-4' />
        </ToolbarButton>

        <ToolbarButton
          onClick={toggleAutoSave}
          tooltip={autoSaveEnabled ? 'Disable auto-save' : 'Enable auto-save'}
          size='sm'
          variant={autoSaveEnabled ? 'default' : 'outline'}
          pressed={autoSaveEnabled}
        >
          <span className='text-xs'>A</span>
        </ToolbarButton>
      </div>
    </div>
  );
}
