'use client';

import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  FolderPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { createDoc } from '@/actions/doc/create-doc';
import { deleteDoc } from '@/actions/doc/delete-doc';
import { moveDoc } from '@/actions/doc/move-doc';
import { updateDoc } from '@/actions/doc/update-doc';
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Types
interface TreeNode {
  id: string;
  title: string;
  type: 'FOLDER' | 'DOCUMENT';
  parentId?: string;
  children?: TreeNode[];
  isExpanded?: boolean;
}

interface EditableTocProps {
  nodes: TreeNode[];
  onNodesChange: (nodes: TreeNode[]) => void;
}

interface DragItem {
  id: string;
  type: 'FOLDER' | 'DOCUMENT';
  title: string;
  parentId?: string;
}

const ItemTypes = {
  NODE: 'node',
};

// Tree Node Component
interface TreeNodeProps {
  node: TreeNode;
  level: number;
  onToggle: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onMove: (dragId: string, dropId: string, position: 'before' | 'after' | 'inside') => void;
  onAddChild: (parentId: string, type: 'FOLDER' | 'DOCUMENT') => void;
}

function TreeNodeComponent({
  node,
  level,
  onToggle,
  onRename,
  onDelete,
  onMove,
  onAddChild
}: TreeNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const router = useRouter();
  const dropRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.NODE,
    item: { id: node.id, type: node.type, title: node.title, parentId: node.parentId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_item, _monitor) => {
      // Reset drop position when drag ends
      setDropPosition(null);
      // Clear any pending timeouts
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = undefined;
      }
    },
  });

  // Use empty drag preview to prevent interference with hover detection
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.NODE,
    hover: (item: DragItem, monitor) => {
      if (!dropRef.current) return;

      const dragId = item.id;
      const dropId = node.id;

      if (dragId === dropId) return;

      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      // Throttle hover updates to prevent conflicts
      hoverTimeoutRef.current = setTimeout(() => {
        if (!dropRef.current) return;

        const hoverBoundingRect = dropRef.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) return;

        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Ensure we're still over the element
        if (hoverClientY < 0 || hoverClientY > hoverBoundingRect.height) return;

        // Determine drop position
        let position: 'before' | 'after' | 'inside' = 'inside';

        if (node.type === 'FOLDER') {
          // Create more generous drop zones for better UX
          const topThreshold = hoverMiddleY * 0.25; // Top 25%
          const bottomThreshold = hoverMiddleY * 1.75; // Bottom 25%

          if (hoverClientY < topThreshold) {
            position = 'before';
          } else if (hoverClientY > bottomThreshold) {
            position = 'after';
          } else {
            position = 'inside';
          }
        } else {
          position = hoverClientY < hoverMiddleY ? 'before' : 'after';
        }

        // Only update if position changed to prevent unnecessary re-renders
        if (dropPosition !== position) {
          setDropPosition(position);
        }
      }, 16); // ~60fps throttling
    },
    drop: (item: DragItem) => {
      onMove(item.id, node.id, dropPosition || 'inside');
      setDropPosition(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  drag(drop(dropRef));

  const handleRename = useCallback(() => {
    if (editValue.trim() && editValue !== node.title) {
      onRename(node.id, editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, node.id, node.title, onRename]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditValue(node.title);
      setIsEditing(false);
    }
  }, [handleRename, node.title]);

  const handleNodeClick = useCallback(() => {
    if (node.type === 'FOLDER') {
      onToggle(node.id);
    } else {
      router.push(`/docs/${node.id}`);
    }
  }, [node.type, node.id, onToggle, router]);

  return (
    <div
      ref={dropRef}
      className={cn(
        'group relative',
        isDragging && 'opacity-50',
        isOver && 'bg-accent/50',
        level > 0 && 'ml-4'
      )}
    >
      {/* Drop indicator */}
      {isOver && (
        <div
          className={cn(
            'absolute inset-x-0 h-0.5 bg-primary z-10',
            dropPosition === 'before' && '-top-px',
            dropPosition === 'after' && '-bottom-px',
            dropPosition === 'inside' && 'inset-0 bg-primary/10 h-auto'
          )}
        />
      )}

      <div
        className={cn(
          'flex items-center gap-2 py-1 px-2 rounded-md transition-colors',
          'hover:bg-accent/50 cursor-pointer group-hover:bg-accent/30'
        )}
      >
        {/* Expand/Collapse Button */}
        {node.type === 'FOLDER' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
          >
            {node.isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

        {/* Icon */}
        <div className="flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              {node.type === 'FOLDER' ? (
                node.isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-blue-500 cursor-pointer" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-500 cursor-pointer" />
                )
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground cursor-pointer" />
              )}
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p>
                {node.type === 'FOLDER'
                  ? node.isExpanded
                    ? `Folder: ${node.title} (expanded${node.children?.length ? ` - ${node.children.length} items` : ' - empty'})`
                    : `Folder: ${node.title} (collapsed${node.children?.length ? ` - ${node.children.length} items` : ' - empty'})`
                  : `Document: ${node.title}`
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0" onClick={handleNodeClick}>
          {isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="h-6 px-1 text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm font-medium truncate block">
              {node.title}
            </span>
          )}
        </div>

        {/* Actions Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {node.type === 'FOLDER' && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddChild(node.id, 'FOLDER');
                    }}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Add Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddChild(node.id, 'DOCUMENT');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {node.type === 'FOLDER' && node.isExpanded && node.children && (
        <div className="mt-1">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onRename={onRename}
              onDelete={onDelete}
              onMove={onMove}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {node.type.toLowerCase()}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{node.title}&rdquo;?
              {node.type === 'FOLDER' && ' All contents will be permanently removed.'}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(node.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Main Editable TOC Component
export function EditableToc({ nodes, onNodesChange }: EditableTocProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleRename = useCallback(async (id: string, newTitle: string) => {
    try {
      const result = await updateDoc({ id, title: newTitle });
      if (result.success) {
        // Update local state
        const updateNodeTitle = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => {
            if (node.id === id) {
              return { ...node, title: newTitle };
            }
            if (node.children) {
              return { ...node, children: updateNodeTitle(node.children) };
            }
            return node;
          });
        };
        onNodesChange(updateNodeTitle(nodes));
      }
    } catch (error) {
      console.error('Failed to rename:', error);
    }
  }, [nodes, onNodesChange]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const result = await deleteDoc({ id });
      if (result.success) {
        // Update local state
        const removeNode = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.filter(node => {
            if (node.id === id) {
              return false;
            }
            if (node.children) {
              return { ...node, children: removeNode(node.children) };
            }
            return true;
          }).map(node => ({
            ...node,
            children: node.children ? removeNode(node.children) : undefined
          }));
        };
        onNodesChange(removeNode(nodes));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }, [nodes, onNodesChange]);

  // Optimistic move function for immediate UI updates
  const performOptimisticMove = useCallback((
    nodes: TreeNode[],
    dragId: string,
    dropId: string,
    position: 'before' | 'after' | 'inside'
  ): TreeNode[] => {
    const clonedNodes = JSON.parse(JSON.stringify(nodes)) as TreeNode[];

    // Find and remove the dragged node
    let draggedNode: TreeNode | null = null;

    const removeNode = (nodeList: TreeNode[]): TreeNode[] => {
      return nodeList.filter(node => {
        if (node.id === dragId) {
          draggedNode = { ...node };
          return false;
        }
        if (node.children) {
          node.children = removeNode(node.children);
        }
        return true;
      });
    };

    const resultNodes = removeNode(clonedNodes);

    if (!draggedNode) return nodes; // If node not found, return original

    // Insert the node at the new position
    const insertNode = (nodeList: TreeNode[]): TreeNode[] => {
      const newList: TreeNode[] = [];

      for (let i = 0; i < nodeList.length; i++) {
        const node = nodeList[i];

        if (node.id === dropId && draggedNode) {
          if (position === 'before') {
            newList.push({ ...draggedNode, parentId: node.parentId } as TreeNode);
            newList.push(node);
          } else if (position === 'after') {
            newList.push(node);
            newList.push({ ...draggedNode, parentId: node.parentId } as TreeNode);
          } else { // inside
            if (node.children) {
              node.children.push({ ...draggedNode, parentId: node.id } as TreeNode);
            } else {
              node.children = [{ ...draggedNode, parentId: node.id } as TreeNode];
            }
            newList.push(node);
          }
        } else {
          if (node.children) {
            node.children = insertNode(node.children);
          }
          newList.push(node);
        }
      }

      return newList;
    };

    return insertNode(resultNodes);
  }, []);

  const handleMove = useCallback(async (dragId: string, dropId: string, position: 'before' | 'after' | 'inside') => {
    // Store original state for potential revert
    const originalNodes = nodes;

    try {
      // Optimistically update the UI first
      const updatedNodes = performOptimisticMove(nodes, dragId, dropId, position);
      onNodesChange(updatedNodes);

      const result = await moveDoc({ dragId, dropId, position });
      if (result.success) {
        // Document moved successfully - the optimistic update was correct
      } else {
        // Revert optimistic update on failure
        onNodesChange(originalNodes);
        console.error('Failed to move document:', result.error);
      }
    } catch (error) {
      // Revert optimistic update on error
      onNodesChange(originalNodes);
      console.error('Failed to move:', error);
    }
  }, [nodes, onNodesChange, performOptimisticMove]);

  const handleAddChild = useCallback(async (parentId: string, type: 'FOLDER' | 'DOCUMENT') => {
    try {
      const title = type === 'FOLDER' ? 'New Folder' : 'New Document';
      const result = await createDoc({
        title,
        parentId,
        isFolder: type === 'FOLDER',
        type: 'GENERAL',
        content: type === 'FOLDER' ? [] : [{ type: 'p', children: [{ text: '' }] }]
      });

      if (result.success && result.data) {
        // Update local state
        const newNode: TreeNode = {
          id: result.data.id,
          title: result.data.title,
          type: type,
          parentId: parentId,
          children: type === 'FOLDER' ? [] : undefined,
          isExpanded: false
        };

        const addChildNode = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => {
            if (node.id === parentId) {
              return {
                ...node,
                children: [...(node.children || []), newNode],
                isExpanded: true
              };
            }
            if (node.children) {
              return { ...node, children: addChildNode(node.children) };
            }
            return node;
          });
        };

        onNodesChange(addChildNode(nodes));
        setExpandedNodes(prev => new Set([...prev, parentId]));
      }
    } catch (error) {
      console.error('Failed to add child:', error);
    }
  }, [nodes, onNodesChange]);

  // Add expanded state to nodes recursively
  const addExpandedState = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map(node => ({
      ...node,
      isExpanded: expandedNodes.has(node.id),
      children: node.children ? addExpandedState(node.children) : undefined
    }));
  };

  const nodesWithExpanded = addExpandedState(nodes);

  return (
    <TooltipProvider>
      <div className="space-y-1">
        {nodesWithExpanded.map((node) => (
          <TreeNodeComponent
            key={node.id}
            node={node}
            level={0}
            onToggle={toggleNode}
            onRename={handleRename}
            onDelete={handleDelete}
            onMove={handleMove}
            onAddChild={handleAddChild}
          />
        ))}
      </div>
    </TooltipProvider>
  );
} 