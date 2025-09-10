import * as React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { uploadFile, STORAGE_BUCKETS, type UploadResult } from '@/lib/supabase/storage';

// Legacy UploadThing types for compatibility
export type UploadedFile = UploadResult & { appUrl?: string };

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
  onUploadBegin?: () => void;
  onUploadProgress?: (progress: number) => void;
  bucket?: string;
  folder?: string;
  headers?: Record<string, string>;
  skipPolling?: boolean;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  onUploadBegin,
  onUploadProgress,
  bucket = STORAGE_BUCKETS.GENERAL,
  folder,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function supabaseUploadFile(file: File): Promise<UploadedFile> {
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    setIsUploading(true);
    setUploadingFile(file);
    setProgress(0);

    // Add to active uploads tracking
    activeUploads.add(uploadId);

    try {
      onUploadBegin?.();

      const result = await uploadFile(file, {
        bucket,
        folder,
        onProgress: (uploadProgress) => {
          setProgress(uploadProgress);
          onUploadProgress?.(uploadProgress);
        },
      });

      const uploadedFileResult: UploadedFile = {
        ...result,
        appUrl: result.url, // For compatibility with UploadThing interface
      };

      setUploadedFile(uploadedFileResult);
      onUploadComplete?.(uploadedFileResult);

      return uploadedFileResult;
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      const message =
        errorMessage.length > 0
          ? errorMessage
          : 'Something went wrong, please try again later.';

      toast.error(message);
      onUploadError?.(error);

      // Mock upload for development/fallback
      const mockUploadedFile: UploadedFile = {
        key: `mock-key-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        appUrl: URL.createObjectURL(file),
      };

      // Simulate upload progress
      let mockProgress = 0;
      const simulateProgress = async () => {
        while (mockProgress < 100) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          mockProgress += 2;
          const currentProgress = Math.min(mockProgress, 100);
          setProgress(currentProgress);
          onUploadProgress?.(currentProgress);
        }
      };

      await simulateProgress();

      setUploadedFile(mockUploadedFile);
      return mockUploadedFile;
    } finally {
      activeUploads.delete(uploadId);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile: supabaseUploadFile,
    uploadingFile,
  };
}

// Supabase-based uploadFiles function for compatibility
export async function uploadFiles(
  _endpoint: string, // For compatibility with UploadThing API
  options: {
    files: File[];
    bucket?: string;
    folder?: string;
    onUploadProgress?: (data: { progress: number }) => void;
  }
): Promise<UploadedFile[]> {
  const { files, bucket = STORAGE_BUCKETS.EDITOR, folder, onUploadProgress } = options;

  const results = await Promise.all(
    files.map(async (file, index) => {
      return await uploadFile(file, {
        bucket,
        folder,
        onProgress: (progress) => {
          // Calculate overall progress across all files
          const overallProgress = ((index * 100) + progress) / files.length;
          onUploadProgress?.({ progress: overallProgress });
        },
      });
    })
  );

  return results.map(result => ({
    ...result,
    appUrl: result.url,
  }));
}

// Compatibility hook for UploadThing users
export function useUploadThing(
  endpoint: keyof { editorUploader: string; duckUploader: string },
  callbacks: {
    onClientUploadComplete?: (res: UploadedFile[]) => void;
    onUploadError?: (error: Error) => void;
    onUploadBegin?: () => void;
    onUploadProgress?: () => void;
  } = {}
) {
  const [isUploading, setIsUploading] = React.useState(false);

  const startUpload = async (files: File[]): Promise<UploadedFile[] | undefined> => {
    setIsUploading(true);

    try {
      callbacks.onUploadBegin?.();

      const bucket = endpoint === 'duckUploader' ? STORAGE_BUCKETS.DUCKS : STORAGE_BUCKETS.EDITOR;
      const results = await uploadFiles(endpoint as string, {
        files,
        bucket,
        onUploadProgress: callbacks.onUploadProgress ? () => callbacks.onUploadProgress!() : undefined,
      });

      callbacks.onClientUploadComplete?.(results);
      return results;
    } catch (error) {
      callbacks.onUploadError?.(error as Error);
      return undefined;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    startUpload,
    isUploading,
  };
}

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

// Global upload tracking
const activeUploads = new Set<string>();

export function useHasActiveUploads() {
  const [hasActiveUploads, setHasActiveUploads] = React.useState(false);

  React.useEffect(() => {
    const checkActiveUploads = () => {
      setHasActiveUploads(activeUploads.size > 0);
    };

    // Check initially
    checkActiveUploads();

    // Set up polling to check for changes
    const interval = setInterval(checkActiveUploads, 100);

    return () => clearInterval(interval);
  }, []);

  return hasActiveUploads;
}