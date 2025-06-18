'use client';


// import { PlaceholderPlugin } from '@platejs/media/react';
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import {
  AudioLinesIcon,
  FileUpIcon,
  FilmIcon,
  ImageIcon,
  LinkIcon,
} from 'lucide-react';
import { isUrl, KEYS } from 'platejs';
import { useEditorRef } from 'platejs/react';
import * as React from 'react';
import { toast } from 'sonner';
// import { useFilePicker } from 'use-file-picker';

import { useSave } from '@/components/editor/plate-provider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import {
  ToolbarSplitButton,
  ToolbarSplitButtonPrimary,
  ToolbarSplitButtonSecondary,
} from './toolbar';

const MEDIA_CONFIG: Record<
  string,
  {
    accept: string[];
    icon: React.ReactNode;
    title: string;
    tooltip: string;
  }
> = {
  [KEYS.audio]: {
    accept: ['audio/*'],
    icon: <AudioLinesIcon className="size-4" />,
    title: 'Audio',
    tooltip: 'Add audio block',
  },
  [KEYS.file]: {
    accept: ['*'],
    icon: <FileUpIcon className="size-4" />,
    title: 'File',
    tooltip: 'Add file block',
  },
  [KEYS.img]: {
    accept: ['image/*'],
    icon: <ImageIcon className="size-4" />,
    title: 'Image',
    tooltip: 'Add image block',
  },
  [KEYS.video]: {
    accept: ['video/*'],
    icon: <FilmIcon className="size-4" />,
    title: 'Video',
    tooltip: 'Add video block',
  },
};

export function MediaToolbarButton({
  nodeType,
  ...props
}: DropdownMenuProps & { nodeType: string }) {
  const currentConfig = MEDIA_CONFIG[nodeType];

  const editor = useEditorRef();
  const { triggerSave } = useSave();
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Insert placeholder block function
  const insertPlaceholderBlock = React.useCallback(async () => {
    editor.tf.insertNodes({
      children: [{ text: '' }],
      id: Date.now().toString(), // Generate unique ID for the placeholder
      mediaType: nodeType,
      type: 'placeholder',
    });
    
    // Save the document with the new placeholder block before any upload starts
    // Only attempt save if save context is available
    if (triggerSave) {
      try {
        await triggerSave();
        console.log('Placeholder block saved to database before upload');
      } catch (error) {
        console.error('Failed to save placeholder block:', error);
        toast.error('Failed to save block. Please try again.');
      }
    } else {
      console.warn('Save functionality not available - placeholder block inserted but not saved immediately');
    }
  }, [editor, nodeType, triggerSave]);

  // const { openFilePicker } = useFilePicker({
  //   accept: currentConfig.accept,
  //   multiple: true,
  //   onFilesSelected: ({ plainFiles: updatedFiles }) => {
  //     editor.getTransforms(PlaceholderPlugin).insert.media(updatedFiles);
  //   },
  // });

  return (
    <>
      <ToolbarSplitButton
        onClick={() => {
          void insertPlaceholderBlock();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        pressed={open}
      >
        <ToolbarSplitButtonPrimary>
          {currentConfig.icon}
        </ToolbarSplitButtonPrimary>

        <DropdownMenu
          open={open}
          onOpenChange={setOpen}
          modal={false}
          {...props}
        >
          <DropdownMenuTrigger asChild>
            <ToolbarSplitButtonSecondary />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            onClick={(e) => e.stopPropagation()}
            align="start"
            alignOffset={-32}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => void insertPlaceholderBlock()}>
                {currentConfig.icon}
                Add {currentConfig.title.toLowerCase()} block
              </DropdownMenuItem>
              {/* <DropdownMenuItem onSelect={() => openFilePicker()}>
                {currentConfig.icon}
                Upload from computer directly
              </DropdownMenuItem> */}
              <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
                <LinkIcon />
                Insert via URL
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ToolbarSplitButton>

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(value) => {
          setDialogOpen(value);
        }}
      >
        <AlertDialogContent className="gap-6">
          <MediaUrlDialogContent
            currentConfig={currentConfig}
            nodeType={nodeType}
            setOpen={setDialogOpen}
          />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function MediaUrlDialogContent({
  currentConfig,
  nodeType,
  setOpen,
}: {
  currentConfig: (typeof MEDIA_CONFIG)[string];
  nodeType: string;
  setOpen: (value: boolean) => void;
}) {
  const editor = useEditorRef();
  const [url, setUrl] = React.useState('');

  const embedMedia = React.useCallback(() => {
    if (!isUrl(url)) {
      toast.error('Invalid URL');
      return;
    }

    setOpen(false);
    editor.tf.insertNodes({
      children: [{ text: '' }],
      name: nodeType === KEYS.file ? url.split('/').pop() : undefined,
      type: nodeType,
      url,
    });
  }, [url, editor, nodeType, setOpen]);

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{currentConfig.title}</AlertDialogTitle>
      </AlertDialogHeader>

      <AlertDialogDescription className="group relative w-full">
        <label
          className="absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground"
          htmlFor="url"
        >
          <span className="inline-flex bg-background px-2">URL</span>
        </label>
        <Input
          id="url"
          className="w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') embedMedia();
          }}
          placeholder=""
          type="url"
          autoFocus
        />
      </AlertDialogDescription>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={(e) => {
            e.preventDefault();
            embedMedia();
          }}
        >
          Accept
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}
