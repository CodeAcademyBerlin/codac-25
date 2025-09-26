import { Suspense } from 'react';

import { DocumentList } from '@/components/documents/document-list';
import { FolderNavigation } from '@/components/documents/folder-navigation';
import { VerticalToolbarSkeleton } from '@/components/skeleton/vertical-toolbar-skeletob';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import {
  getDocumentsInFolder,
  getFolderTreeWithDocuments,
} from '@/data/documents/get-folders';
import { requireServerAuth } from '@/lib/auth/auth-server';

interface DocumentsPageProps {
  searchParams: Promise<{
    folder?: string;
    search?: string;
    page?: string;
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

  // Fetch folders and documents
  const _treeDataPromise = getFolderTreeWithDocuments(user.id);
  const _documentsPromise = getDocumentsInFolder(
    selectedFolderId,
    user.id,
    50,
    0
  );

  return (
    <div className='min-h-screen bg-background'>
      <ResizablePanelGroup direction='horizontal' className='h-full w-full'>
        <ResizablePanel
          defaultSize={SIDE_PANEL_DEFAULT_SIZE}
          minSize={SIDE_PANEL_MIN_SIZE}
          maxSize={SIDE_PANEL_MAX_SIZE}
          className='border-r'
        >
          <FolderNavigation
            _treeDataPromise={_treeDataPromise}
            selectedFolderId={selectedFolderId}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={MAIN_PANEL_DEFAULT_SIZE}
          minSize={MAIN_PANEL_MIN_SIZE}
          maxSize={MAIN_PANEL_MAX_SIZE}
        >
          <DocumentList
            _documentsPromise={_documentsPromise}
            selectedFolderId={selectedFolderId}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
