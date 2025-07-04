'use client';

import {
    ArrowUpToLineIcon,
    BaselineIcon,
    BoldIcon,
    Code2Icon,
    HighlighterIcon,
    ItalicIcon,
    PaintBucketIcon,
    Save,
    StrikethroughIcon,
    UnderlineIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorReadOnly } from 'platejs/react';
import * as React from 'react';

import { useSave } from '@/components/editor/unified-editor';

import { AlignToolbarButton } from './align-toolbar-button';
import { Button } from './button';
import { EmojiToolbarButton } from './emoji-toolbar-button';
import { ExportToolbarButton } from './export-toolbar-button';
import { FontColorToolbarButton } from './font-color-toolbar-button';
import { FontSizeToolbarButton } from './font-size-toolbar-button';
import { RedoToolbarButton, UndoToolbarButton } from './history-toolbar-button';
import { ImportToolbarButton } from './import-toolbar-button';
import {
    IndentToolbarButton,
    OutdentToolbarButton,
} from './indent-toolbar-button';
import { LineHeightToolbarButton } from './line-height-toolbar-button';
import { LinkToolbarButton } from './link-toolbar-button';
import {
    BulletedListToolbarButton,
    NumberedListToolbarButton,
    TodoListToolbarButton,
} from './list-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { MediaToolbarButton } from './media-toolbar-button';
import { ModeToolbarButton } from './mode-toolbar-button';
import { MoreToolbarButton } from './more-toolbar-button';
import { TableToolbarButton } from './table-toolbar-button';
import { ToggleToolbarButton } from './toggle-toolbar-button';
import { ToolbarGroup } from './toolbar';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button';

export function FixedToolbarButtons() {
    const readOnly = useEditorReadOnly();
    const { triggerSave, saveStatus } = useSave();

    return (
        <div className="flex w-full flex-wrap gap-1 items-center">
            {!readOnly && (
                <>
                    <ToolbarGroup>
                        <UndoToolbarButton />
                        <RedoToolbarButton />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <ExportToolbarButton>
                            <ArrowUpToLineIcon />
                        </ExportToolbarButton>
                        <ImportToolbarButton />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <TurnIntoToolbarButton />
                        <FontSizeToolbarButton />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <MarkToolbarButton nodeType={KEYS.bold} tooltip="Bold (⌘+B)">
                            <BoldIcon />
                        </MarkToolbarButton>

                        <MarkToolbarButton nodeType={KEYS.italic} tooltip="Italic (⌘+I)">
                            <ItalicIcon />
                        </MarkToolbarButton>

                        <MarkToolbarButton
                            nodeType={KEYS.underline}
                            tooltip="Underline (⌘+U)"
                        >
                            <UnderlineIcon />
                        </MarkToolbarButton>

                        <MarkToolbarButton
                            nodeType={KEYS.strikethrough}
                            tooltip="Strikethrough (⌘+⇧+M)"
                        >
                            <StrikethroughIcon />
                        </MarkToolbarButton>

                        <MarkToolbarButton nodeType={KEYS.code} tooltip="Code (⌘+E)">
                            <Code2Icon />
                        </MarkToolbarButton>

                        <FontColorToolbarButton nodeType={KEYS.color} tooltip="Text color">
                            <BaselineIcon />
                        </FontColorToolbarButton>

                        <FontColorToolbarButton
                            nodeType={KEYS.backgroundColor}
                            tooltip="Background color"
                        >
                            <PaintBucketIcon />
                        </FontColorToolbarButton>
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <AlignToolbarButton />
                        <NumberedListToolbarButton />
                        <BulletedListToolbarButton />
                        <TodoListToolbarButton />
                        <ToggleToolbarButton />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <LinkToolbarButton />
                        <TableToolbarButton />
                        <EmojiToolbarButton />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <MediaToolbarButton nodeType={KEYS.img} />
                        <MediaToolbarButton nodeType={KEYS.video} />
                        <MediaToolbarButton nodeType={KEYS.audio} />
                        <MediaToolbarButton nodeType={KEYS.file} />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <LineHeightToolbarButton />
                        <OutdentToolbarButton />
                        <IndentToolbarButton />
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <MoreToolbarButton />
                    </ToolbarGroup>
                </>
            )}

            <div className="flex-1 min-w-0" />

            {/* Save Section - Always visible when editing */}
            {!readOnly && (
                <ToolbarGroup>
                    <Button
                        variant={saveStatus?.hasUnsavedChanges ? "default" : "outline"}
                        size="sm"
                        onClick={triggerSave}
                        disabled={saveStatus?.status === 'saving'}
                        className="gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {saveStatus?.status === 'saving' ? 'Saving...' : 'Save'}
                    </Button>
                </ToolbarGroup>
            )}

            <ToolbarGroup>
                <MarkToolbarButton nodeType={KEYS.highlight} tooltip="Highlight">
                    <HighlighterIcon />
                </MarkToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup>
                <ModeToolbarButton />
            </ToolbarGroup>
        </div>
    );
} 