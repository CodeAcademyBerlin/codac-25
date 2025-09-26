'use client';

import {
  hotkeysCoreFeature,
  renamingFeature,
  selectionFeature,
  syncDataLoaderFeature,
  dragAndDropFeature,
} from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import {
  Folder,
  FolderOpen,
  MoreVertical,
  Plus,
  FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useState, Suspense } from 'react';
import { toast } from 'sonner';

import { createFolder } from '@/actions/documents/create-folder';
import { deleteFolder as deleteFolderAction } from '@/actions/documents/delete-folder';
import { updateFolder as updateFolderAction } from '@/actions/documents/update-folder';
import { Tree, TreeItem, TreeItemLabel } from '@/components/tree';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FolderTreeItem } from '@/data/documents/get-folders';
import { cn } from '@/lib/utils';

import { VerticalToolbarSkeleton } from '../skeleton/vertical-toolbar-skeletob';

interface FolderNavigationProps {
  _treeDataPromise: Promise<{
    items: Record<string, FolderTreeItem>;
    rootIds: string[];
  }>;
  selectedFolderId: string | null;
}

interface RootItem {
  id: string;
  name: string;
  type: 'folder';
  color: string;
  icon: string | null;
  documentCount: number;
  children: string[];
}


// Tree content component that uses the promise
function TreeContent({
  _treeDataPromise,
  selectedFolderId,
}: FolderNavigationProps) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');
  const [createInFolder, setCreateInFolder] = useState<string | null>(null);

  const treeData = use(_treeDataPromise);

  const tree = useTree<FolderTreeItem>({
    initialState: {
      expandedItems: Object.keys(treeData.items).filter(id => treeData.items[id]?.type === 'folder'), // Start with all folders expanded
      selectedItems: selectedFolderId ? [selectedFolderId] : [],
    },
    indent: 10,
    rootItemId: 'root',
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().type === 'folder',
    dataLoader: {
      getItem: (itemId: string): FolderTreeItem | RootItem => {
        if (itemId === 'root') {
          return {
            id: 'root',
            name: 'Root',
            type: 'folder',
            color: '#3B82F6',
            icon: null,
            documentCount: 0,
            children: treeData.rootIds
          };
        }
        const item = treeData.items[itemId];
        if (!item) {
          throw new Error(`Item with id ${itemId} not found`);
        }
        return item;
      },
      getChildren: (itemId: string): string[] => {
        if (itemId === 'root') {
          return treeData.rootIds;
        }
        return treeData.items[itemId]?.children ?? [];
      },
    },
    onRename: async (item: { getId: () => string }, newName: string) => {
      const result = await updateFolderAction({
        id: item.getId(),
        name: newName,
      });

      if (result.success) {
        toast.success('Folder renamed successfully');
        router.refresh();
      } else {
        toast.error('Failed to rename folder');
      }
    },
    features: [
      syncDataLoaderFeature,
      hotkeysCoreFeature,
      renamingFeature,
      selectionFeature,
      dragAndDropFeature,
    ],
  });

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required');
      return;
    }

    const result = await createFolder({
      name: newFolderName.trim(),
      color: newFolderColor,
      parentId: createInFolder ?? undefined,
    });

    if (result.success) {
      toast.success('Folder created successfully');
      setShowCreateDialog(false);
      setNewFolderName('');
      setCreateInFolder(null);
      router.refresh();
    } else {
      toast.error('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folder = treeData.items[folderId];
    if (!folder) return;

    if (
      confirm(
        `Are you sure you want to delete "${folder.name}" and all its contents?`
      )
    ) {
      const result = await deleteFolderAction({
        id: folderId,
      });

      if (result.success) {
        toast.success('Folder deleted successfully');
        router.refresh();
        if (selectedFolderId === folderId) {
          router.push('/docs');
        }
      } else {
        toast.error('Failed to delete folder');
      }
    }
  };

  return (
    <div className='h-full w-full flex flex-col'>
      <div className='flex items-center justify-between p-3 border-b'>
        <h3 className='font-semibold text-sm'>Folders</h3>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            setCreateInFolder(null);
            setShowCreateDialog(true);
          }}
        >
          <Plus className='h-4 w-4' />
        </Button>
      </div>

      <div className='overflow-y-auto flex-1'>
        <div className='p-2'>
          {/* Root folder (all documents) */}
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
              'hover:bg-muted/50',
              selectedFolderId === null && 'bg-primary/10 text-primary'
            )}
            onClick={() => {
              // Check if we're in LMS context by looking at current pathname
              const isLMSContext = window.location.pathname.startsWith('/lms');
              const basePath = isLMSContext ? '/lms' : '/docs';
              router.push(basePath);
            }}
          >
            {/* <FileText className='h-4 w-4' />
            <span className='text-xs font-medium text-left'>All Documents</span> */}
          </div>

          {/* Tree component */}
          <Tree indent={12} tree={tree}>
            {tree.getItems().map((item) => {
              const itemData = item.getItemData();
              const isFolder = itemData.type === 'folder';

              return (
                <TreeItem key={item.getId()} item={item}>
                  <TreeItemLabel
                    onClick={() => {
                      const itemId = item.getId();
                      if (isFolder) {
                        const params = new URLSearchParams();
                        if (itemId !== 'root') {
                          params.set('folder', itemId);
                        }
                        const queryString = params.toString();
                        // Check if we're in LMS context by looking at current pathname
                        const isLMSContext = window.location.pathname.startsWith('/lms');
                        const basePath = isLMSContext ? '/lms' : '/docs';
                        router.push(`${basePath}${queryString ? `?${queryString}` : ''}`);
                      } else {
                        // Handle document click - navigate to document
                        // Check if we're in LMS context by looking at current pathname
                        const isLMSContext = window.location.pathname.startsWith('/lms');
                        const basePath = isLMSContext ? '/lms' : '/docs';

                        if (itemData.slug) {
                          router.push(`${basePath}/${itemData.slug}`);
                        } else {
                          // Document doesn't have a slug, show error or skip
                          toast.error('Document is not accessible (no slug available)');
                        }
                      }
                    }}
                  >
                    <div className='flex items-center gap-2 w-full group'>
                      {/* Icon */}
                      <div className='flex-shrink-0'>
                        {isFolder ? (
                          itemData.icon === 'folder-open' ? (
                            <FolderOpen
                              className='h-4 w-4'
                              style={{ color: itemData.color }}
                            />
                          ) : (
                            <Folder
                              className='h-4 w-4'
                              style={{ color: itemData.color }}
                            />
                          )
                        ) : (
                          <FileText className='h-4 w-4 text-muted-foreground' />
                        )}
                      </div>

                      {/* Name */}
                      <span className='text-xs font-medium truncate flex-1 text-left'>
                        {item.isRenaming() ? (
                          <Input
                            {...item.getRenameInputProps()}
                            autoFocus
                            className='h-5 text-xs text-left'
                          />
                        ) : (
                          itemData.name
                        )}
                      </span>

                      {/* Document count badge for folders */}
                      {isFolder && itemData.documentCount && itemData.documentCount > 0 && (
                        <Badge variant='secondary' className='text-xs px-1.5 py-0.5'>
                          {itemData.documentCount}
                        </Badge>
                      )}

                      {/* Published indicator for documents */}
                      {!isFolder && itemData.isPublished && (
                        <Badge variant='outline' className='text-xs px-1.5 py-0.5'>
                          Published
                        </Badge>
                      )}

                      {/* Actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div
                            className='h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center hover:bg-muted rounded'
                            onClick={e => e.stopPropagation()}
                          >
                            <MoreVertical className='h-3 w-3' />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='start'>
                          {isFolder ? (
                            <>
                              <DropdownMenuItem onClick={() => item.startRenaming()}>
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCreateInFolder(item.getId());
                                  setShowCreateDialog(true);
                                }}
                              >
                                <Plus className='h-3 w-3 mr-2' />
                                Add Subfolder
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteFolder(item.getId())}
                                className='text-destructive'
                              >
                                Delete
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => item.startRenaming()}>
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteFolder(item.getId())}
                                className='text-destructive'
                              >
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TreeItemLabel>
                </TreeItem>
              );
            })}
          </Tree>
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              {createInFolder
                ? 'Create a new subfolder'
                : 'Create a new folder in your documents'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='folder-name'>Folder Name</Label>
              <Input
                id='folder-name'
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder='Enter folder name'
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor='folder-color'>Color</Label>
              <div className='flex items-center gap-2'>
                <input
                  type='color'
                  id='folder-color'
                  value={newFolderColor}
                  onChange={e => setNewFolderColor(e.target.value)}
                  className='w-10 h-8 border rounded'
                />
                <Input
                  value={newFolderColor}
                  onChange={e => setNewFolderColor(e.target.value)}
                  className='flex-1'
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main component with Suspense boundary
export function FolderNavigation({
  _treeDataPromise,
  selectedFolderId,
}: FolderNavigationProps) {
  return (
    <Suspense fallback={<VerticalToolbarSkeleton />}>
      <TreeContent
        _treeDataPromise={_treeDataPromise}
        selectedFolderId={selectedFolderId}
      />
    </Suspense>
  );
}
