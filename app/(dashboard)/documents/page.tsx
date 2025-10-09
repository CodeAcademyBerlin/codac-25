import { Suspense } from 'react';

import { DocsPageSkeleton } from '@/components/documents/docs-page-skeleton';
import { DocumentList } from '@/components/documents/document-list';
import { DocumentPreview } from '@/components/documents/document-preview';
import { DocumentPreviewSkeleton } from '@/components/documents/document-preview-skeleton';
import { VerticalToolbarSkeleton } from '@/components/skeleton/vertical-toolbar-skeleton';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { getDocumentById } from '@/data/documents/get-document';
import {
  getDocumentsInFolder,
  getFolderTreeWithDocuments,
} from '@/data/documents/get-folders';
import { requireServerAuth } from '@/lib/auth/auth-server';

import { FolderNavigation } from '../../../components/documents/folder-navigation';

interface DocumentsPageProps {
  searchParams: Promise<{
    folder?: string;
    search?: string;
    page?: string;
    preview?: string;
  }>;
}
const SIDE_PANEL_DEFAULT_SIZE = 25;
const MAIN_PANEL_DEFAULT_SIZE = 100 - SIDE_PANEL_DEFAULT_SIZE;

const SIDE_PANEL_MIN_SIZE = 15;
const SIDE_PANEL_MAX_SIZE = 30;

const MAIN_PANEL_MAX_SIZE = 100 - SIDE_PANEL_MIN_SIZE;
const MAIN_PANEL_MIN_SIZE = 100 - SIDE_PANEL_MAX_SIZE;
export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const user = await requireServerAuth();
  const params = await searchParams;
  const selectedFolderId = params.folder ?? null;
  const previewDocId = params.preview ?? null;

  // Fetch folders and documents
  const _treeDataPromise = getFolderTreeWithDocuments(user.id);
  const _documentsPromise = getDocumentsInFolder(
    selectedFolderId,
    user.id,
    50,
    0
  );

  // If preview mode, fetch the specific document
  const _previewDocumentPromise = previewDocId
    ? getDocumentById(previewDocId)
    : null;
  return (
    <div className='min-h-screen bg-background'>
      <ResizablePanelGroup direction='horizontal' className='h-full w-full'>
        <ResizablePanel
          defaultSize={SIDE_PANEL_DEFAULT_SIZE}
          minSize={SIDE_PANEL_MIN_SIZE}
          maxSize={SIDE_PANEL_MAX_SIZE}
          className='border-r'
        >
          <Suspense fallback={<VerticalToolbarSkeleton />}>
            <FolderNavigation
              _treeDataPromise={_treeDataPromise}
              selectedFolderId={selectedFolderId}
            />
            {/* <DocsFolderNavigation
                _treeDataPromise={_treeDataPromise}
                selectedFolderId={selectedFolderId}
              /> */}
          </Suspense>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          defaultSize={MAIN_PANEL_DEFAULT_SIZE}
          minSize={MAIN_PANEL_MIN_SIZE}
          maxSize={MAIN_PANEL_MAX_SIZE}
        >
          {previewDocId ? (
            <Suspense fallback={<DocumentPreviewSkeleton />}>
              <DocumentPreview _documentPromise={_previewDocumentPromise!} />
            </Suspense>
          ) : (
            <Suspense fallback={<DocsPageSkeleton />}>
              <DocumentList
                _documentsPromise={_documentsPromise}
                selectedFolderId={selectedFolderId}
              />
            </Suspense>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
