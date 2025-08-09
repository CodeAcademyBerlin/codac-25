import { generateReactHelpers } from '@uploadthing/react';
import * as React from 'react';
import { toast } from 'sonner';
import type {
  ClientUploadedFileData,
  UploadFilesOptions,
} from 'uploadthing/types';
import { z } from 'zod';

import type { OurFileRouter } from '@/lib/editor/uploadthing';

export type UploadedFile<T = unknown> = ClientUploadedFileData<T>;

interface UseUploadFileProps
  extends Pick<
    UploadFilesOptions<OurFileRouter['editorUploader']>,
    'headers' | 'onUploadBegin' | 'onUploadProgress' | 'skipPolling'
  > {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  ...props
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadThing(file: File) {
    setIsUploading(true);
    setUploadingFile(file);

    try {
      const res = await uploadFiles('editorUploader', {
        ...props,
        files: [file],
        onUploadProgress: ({ progress }) => {
          setProgress(Math.min(progress, 100));
        },
      });

      setUploadedFile(res[0]);

      onUploadComplete?.(res[0]);

      return uploadedFile;
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      const message =
        errorMessage.length > 0
          ? errorMessage
          : 'Something went wrong, please try again later.';

      toast.error(message);

      onUploadError?.(error);
      throw error;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile: uploadThing,
    uploadingFile,
  };
}

export const { uploadFiles, useUploadThing } =
  generateReactHelpers<OurFileRouter>();

export function getErrorMessage(err: unknown) {
  const unknownError = 'Something went wrong, please try again later.';

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => {
      return issue.message;
    });

    return errors.join('\n');
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return unknownError;
  }
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err);

  return toast.error(errorMessage);
}

// Custom hook to check if any uploads are in progress globally
export function useHasActiveUploads() {
  const [hasActiveUploads, setHasActiveUploads] = React.useState(false);

  // This will be set by PlaceholderElements when they start/stop uploading
  React.useEffect(() => {
    const checkUploads = () => {
      // Check if there are any elements with isUploading state
      const uploadingElements = document.querySelectorAll('[data-uploading="true"]');
      setHasActiveUploads(uploadingElements.length > 0);
    };

    // Check immediately
    checkUploads();

    // Set up a MutationObserver to watch for changes
    const observer = new MutationObserver(checkUploads);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-uploading']
    });

    // Also check periodically as a fallback
    const interval = setInterval(checkUploads, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return hasActiveUploads;
}
