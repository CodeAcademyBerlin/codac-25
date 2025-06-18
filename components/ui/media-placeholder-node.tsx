'use client';

import {
  PlaceholderPlugin,
  PlaceholderProvider,
  updateUploadHistory,
} from '@platejs/media/react';
import { AudioLines, FileUp, Film, ImageIcon, Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import type { TPlaceholderElement } from 'platejs';
import { KEYS } from 'platejs';
import type { PlateElementProps } from 'platejs/react';
import { PlateElement, useEditorPlugin, withHOC } from 'platejs/react';
import * as React from 'react';
import { useFilePicker } from 'use-file-picker';

import { useUploadFile } from '@/hooks/use-upload-file';
import { cn } from '@/lib/utils';


const CONTENT: Record<
  string,
  {
    accept: string[];
    content: React.ReactNode;
    icon: React.ReactNode;
  }
> = {
  [KEYS.audio]: {
    accept: ['audio/*'],
    content: 'Add an audio file',
    icon: <AudioLines />,
  },
  [KEYS.file]: {
    accept: ['*'],
    content: 'Add a file',
    icon: <FileUp />,
  },
  [KEYS.img]: {
    accept: ['image/*'],
    content: 'Add an image',
    icon: <ImageIcon />,
  },
  [KEYS.video]: {
    accept: ['video/*'],
    content: 'Add a video',
    icon: <Film />,
  },
};

export const PlaceholderElement = withHOC(
  PlaceholderProvider,
  function PlaceholderElement(props: PlateElementProps<TPlaceholderElement>) {
    const { editor, element } = props;

    const { api } = useEditorPlugin(PlaceholderPlugin);

    const { isUploading, progress, uploadedFile, uploadFile, uploadingFile } =
      useUploadFile();

    const loading = isUploading && uploadingFile;

    const currentContent = CONTENT[element.mediaType];

    const isImage = element.mediaType === KEYS.img;

    const imageRef = React.useRef<HTMLImageElement>(null);
    
    // Store dimensions separately to ensure they persist
    const imageDimensionsRef = React.useRef<{ width: number; height: number } | null>(null);

    const { openFilePicker } = useFilePicker({
      accept: currentContent.accept,
      multiple: true,
      onFilesSelected: ({ plainFiles: updatedFiles }) => {
        const firstFile = updatedFiles[0];
        const restFiles = updatedFiles.slice(1);

        replaceCurrentPlaceholder(firstFile);

        if (restFiles.length > 0) {
          editor.getTransforms(PlaceholderPlugin).insert.media(restFiles);
        }
      },
    });

    const replaceCurrentPlaceholder = React.useCallback(
      (file: File) => {
        if (!api || !api.placeholder) {
          console.error('API or placeholder API not available');
          return;
        }
        
        try {
          void uploadFile(file);
          api.placeholder.addUploadingFile(element.id as string, file);
        } catch (error) {
          console.error('Error in replaceCurrentPlaceholder:', error);
        }
      },
      [api, api?.placeholder, element.id, uploadFile]
    );

    React.useEffect(() => {
      if (!uploadedFile || !editor || !editor.api || !editor.tf) return;

      try {
        const path = editor.api.findPath(element);
        
        if (!path) {
          console.warn('Could not find path for element', element);
          return;
        }

        editor.tf.withoutSaving(() => {
          editor.tf.removeNodes({ at: path });

          // Get dimensions from stored ref, imageRef, or use defaults
          let width: number | undefined;
          let height: number | undefined;
          
          // First try to get dimensions from our stored ref
          if (imageDimensionsRef.current) {
            width = imageDimensionsRef.current.width;
            height = imageDimensionsRef.current.height;
          }
          // Fallback to imageRef if dimensions ref is not available
          else if (imageRef?.current) {
            width = (imageRef.current as any).__originalWidth || imageRef.current.width || imageRef.current.naturalWidth;
            height = (imageRef.current as any).__originalHeight || imageRef.current.height || imageRef.current.naturalHeight;
          }
          
          // Set default dimensions for media if none found
          if (element.mediaType === KEYS.img && (!width || !height)) {
            width = width || 800;  // Default width
            height = height || 600; // Default height
          } else if (element.mediaType === KEYS.video && (!width || !height)) {
            width = width || 800;  // Default width for video
            height = height || 450; // Default height for video (16:9 aspect ratio)
          }

          const node = {
            children: [{ text: '' }],
            initialHeight: height,
            initialWidth: width,
            isUpload: true,
            name: element.mediaType === KEYS.file ? uploadedFile.name : '',
            placeholderId: element.id as string,
            type: element.mediaType!,
            url: uploadedFile.url,
            // Add width and height directly to the node for immediate use
            ...(width && { width }),
            ...(height && { height }),
          };

          editor.tf.insertNodes(node, { at: path });

          updateUploadHistory(editor, node);
        });

        api.placeholder.removeUploadingFile(element.id as string);
      } catch (error) {
        console.error('Error replacing placeholder with uploaded file:', error);
        // Remove the uploading file from state even if there's an error
        api.placeholder.removeUploadingFile(element.id as string);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadedFile, element.id]);

    // React dev mode will call React.useEffect twice
    const isReplaced = React.useRef(false);

    /** Paste and drop */
    React.useEffect(() => {
      if (isReplaced.current || !editor || !api) return;

      isReplaced.current = true;
      
      try {
        const currentFiles = api.placeholder.getUploadingFile(
          element.id as string
        );

        if (!currentFiles) return;

        replaceCurrentPlaceholder(currentFiles);
      } catch (error) {
        console.error('Error handling paste/drop files:', error);
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReplaced]);

    return (
      <PlateElement 
        className="my-1" 
        {...props}
        data-uploading={loading ? 'true' : 'false'}
      >
        {!loading && (
          <div
            className={cn(
              'flex cursor-pointer items-center rounded-sm bg-muted p-3 pr-9 select-none hover:bg-primary/10'
            )}
            onClick={() => openFilePicker()}
            contentEditable={false}
          >
            <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">
              {currentContent.icon}
            </div>
            <div className="text-sm whitespace-nowrap text-muted-foreground">
              <div>{currentContent.content}</div>
            </div>
          </div>
        )}

        {loading && !isImage && (
          <div
            className={cn(
              'flex cursor-pointer items-center rounded-sm bg-muted p-3 pr-9 select-none hover:bg-primary/10'
            )}
            contentEditable={false}
          >
            <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">
              {currentContent.icon}
            </div>
            <div className="text-sm whitespace-nowrap text-muted-foreground">
              <div>{uploadingFile?.name}</div>
              <div className="mt-1 flex items-center gap-1.5">
                <div>{formatBytes(uploadingFile?.size ?? 0)}</div>
                <div>–</div>
                                  <div className="flex items-center">
                    <Loader2Icon className="mr-1 size-3.5 animate-spin text-muted-foreground" />
                    {Math.round(progress ?? 0)}%
                  </div>
              </div>
            </div>
          </div>
        )}

        {isImage && loading && (
          <ImageProgress
            file={uploadingFile}
            imageRef={imageRef}
            progress={progress}
            onDimensionsLoaded={(dimensions) => {
              imageDimensionsRef.current = dimensions;
            }}
          />
        )}

        {props.children}
      </PlateElement>
    );
  }
);

export function ImageProgress({
  className,
  file,
  imageRef,
  progress = 0,
  onDimensionsLoaded,
}: {
  file: File;
  className?: string;
  imageRef?: React.RefObject<HTMLImageElement | null>;
  progress?: number;
  onDimensionsLoaded?: (dimensions: { width: number; height: number }) => void;
}) {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number } | null>(null);
  const [loadError, setLoadError] = React.useState<boolean>(false);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    // Get image dimensions
    const img = new window.Image();
    img.onload = () => {
      const imgDimensions = { width: img.width, height: img.height };
      setDimensions(imgDimensions);
      setLoadError(false);
      
      // Notify parent component about the dimensions
      onDimensionsLoaded?.(imgDimensions);
      
      // Update the ref with the actual image element and dimensions
      if (imageRef && imageRef.current) {
        imageRef.current.width = img.width;
        imageRef.current.height = img.height;
        // Store dimensions as custom properties for later access
        (imageRef.current as any).__originalWidth = img.width;
        (imageRef.current as any).__originalHeight = img.height;
      }
    };
    img.onerror = () => {
      setLoadError(true);
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, imageRef]);

  if (loadError) {
    return (
      <div className={cn('relative bg-muted rounded-sm p-4', className)} contentEditable={false}>
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <div className="text-center">
            <p className="text-sm">Failed to load image preview</p>
            <p className="text-xs mt-1">{file.name}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!objectUrl || !dimensions) {
    return (
      <div className={cn('relative bg-muted rounded-sm', className)} contentEditable={false}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground mt-2">Loading preview...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate responsive dimensions while maintaining aspect ratio
  const maxWidth = 600;
  const maxHeight = 400;
  const aspectRatio = dimensions.width / dimensions.height;
  
  let displayWidth = dimensions.width;
  let displayHeight = dimensions.height;
  
  if (displayWidth > maxWidth) {
    displayWidth = maxWidth;
    displayHeight = maxWidth / aspectRatio;
  }
  
  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = maxHeight * aspectRatio;
  }

  return (
    <div className={cn('relative', className)} contentEditable={false}>
      <Image
        ref={imageRef}
        className="h-auto w-full rounded-sm object-cover"
        alt={file.name}
        src={objectUrl}
        width={Math.round(displayWidth)}
        height={Math.round(displayHeight)}
        style={{ maxHeight: '400px', objectFit: 'contain' }}
        priority={true}
      />
      {progress < 100 && (
        <div className="absolute right-1 bottom-1 flex items-center space-x-2 rounded-full bg-black/70 backdrop-blur-sm px-2 py-1">
          <Loader2Icon className="size-3 animate-spin text-white" />
          <span className="text-xs font-medium text-white">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      {progress === 100 && (
        <div className="absolute right-1 bottom-1 rounded-full bg-green-500/80 backdrop-blur-sm p-1">
          <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];

  if (bytes === 0) return '0 Byte';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
    }`;
}
