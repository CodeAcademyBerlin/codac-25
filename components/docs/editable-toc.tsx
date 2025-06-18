'use client';

import { useState, useCallback, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';
import { createDoc } from '@/actions/doc/create-doc';
import { updateDoc } from '@/actions/doc/update-doc';
import { deleteDoc } from '@/actions/doc/delete-doc';

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
  const router = useRouter();
  const dragRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.NODE,
    item: { id: node.id, type: node.type, title: node.title, parentId: node.parentId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, dropPosition }, drop] = useDrop({
    accept: ItemTypes.NODE,
    hover: (item: DragItem, monitor) => {
      if (!dropRef.current) return;
      
      const dragId = item.id;
      const dropId = node.id;
      
      if (dragId === dropId) return;
      
      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Determine drop position
      let position: 'before' | 'after' | 'inside' = 'inside';
      
      if (node.type === 'FOLDER') {
        if (hoverClientY < hoverMiddleY / 2) {
          position = 'before';
        } else if (hoverClientY > hoverMiddleY + hoverMiddleY / 2) {
          position = 'after';
        } else {
          position = 'inside';
        }
      } else {
        position = hoverClientY < hoverMiddleY ? 'before' : 'after';
      }
      
      return { position };
    },
    drop: (item: DragItem, monitor) => {
      const result = monitor.getDropResult();
      const position = result?.position || 'inside';
      onMove(item.id, node.id, position);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      dropPosition: monitor.getDropResult()?.position,
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
          {node.type === 'FOLDER' ? (
            node.isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500" />
            )
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
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
              Are you sure you want to delete "{node.title}"? 
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
      const result = await updateDoc(id, { title: newTitle });
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
      const result = await deleteDoc(id);
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

  const handleMove = useCallback(async (dragId: string, dropId: string, position: 'before' | 'after' | 'inside') => {
    // Implement move logic
    console.log('Move:', { dragId, dropId, position });
    // TODO: Implement server action for moving nodes
  }, []);

  const handleAddChild = useCallback(async (parentId: string, type: 'FOLDER' | 'DOCUMENT') => {
    try {
      const title = type === 'FOLDER' ? 'New Folder' : 'New Document';
      const result = await createDoc({
        title,
        parentId,
        type: type === 'FOLDER' ? 'GENERAL' : 'GENERAL', // Folders can be represented as documents with special type
        content: type === 'FOLDER' ? undefined : [{ type: 'p', children: [{ text: '' }] }]
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

  // Add expanded state to nodes
  const nodesWithExpanded = nodes.map(node => ({
    ...node,
    isExpanded: expandedNodes.has(node.id),
    children: node.children?.map(child => ({
      ...child,
      isExpanded: expandedNodes.has(child.id)
    }))
  }));

  return (
    <DndProvider backend={HTML5Backend}>
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
    </DndProvider>
  );
} 