'use client';

import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    FolderOpen,
    Folder,
    FileText,
    MoreHorizontal,
    Edit2,
    Trash2,
    PlayCircle,
    GripVertical
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { toast } from 'sonner';

import { moveLesson } from '@/actions/lms/move-lesson';
import { moveProject } from '@/actions/lms/move-project';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { LMSTreeNode } from '@/data/lms/lms-hierarchy';
import { cn } from '@/lib/utils';

interface LMSTreeSidebarProps {
    nodes: LMSTreeNode[];
    onNodesChange: (nodes: LMSTreeNode[]) => void;
    canEdit?: boolean;
}

interface DragItem {
    id: string;
    type: 'COURSE' | 'PROJECT' | 'LESSON';
    title: string;
    parentId?: string;
}

const ItemTypes = {
    LMS_NODE: 'lms_node',
};

// Tree Node Component
interface LMSTreeNodeProps {
    node: LMSTreeNode;
    level: number;
    onToggle: (id: string) => void;
    onMove: (dragId: string, dropId: string, dropType: 'COURSE' | 'PROJECT' | 'LESSON', position: 'before' | 'after' | 'inside') => void;
    canEdit?: boolean;
}

function LMSTreeNodeComponent({
    node,
    level,
    onToggle,
    onMove,
    canEdit = false
}: LMSTreeNodeProps) {
    const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
    const router = useRouter();
    const dropRef = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.LMS_NODE,
        item: { id: node.id, type: node.type, title: node.title, parentId: node.parentId },
        canDrag: canEdit,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.LMS_NODE,
        canDrop: (item: DragItem) => {
            // Prevent dropping on itself
            if (item.id === node.id) return false;

            // Define valid drop combinations
            if (item.type === 'LESSON' && (node.type === 'PROJECT' || node.type === 'LESSON')) return true;
            if (item.type === 'PROJECT' && (node.type === 'COURSE' || node.type === 'PROJECT')) return true;

            return false;
        },
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

            // Allow inside drop for containers (Course can contain Projects, Project can contain Lessons)
            if ((node.type === 'COURSE' && item.type === 'PROJECT') ||
                (node.type === 'PROJECT' && item.type === 'LESSON')) {
                if (hoverClientY < hoverMiddleY / 2) {
                    position = 'before';
                } else if (hoverClientY > hoverMiddleY + hoverMiddleY / 2) {
                    position = 'after';
                } else {
                    position = 'inside';
                }
            } else {
                // For same-level items, only allow before/after
                position = hoverClientY < hoverMiddleY ? 'before' : 'after';
            }

            setDropPosition(position);
        },
        drop: (item: DragItem) => {
            onMove(item.id, node.id, node.type, dropPosition || 'inside');
            setDropPosition(null);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
        }),
    });

    drag(drop(dropRef));

    const handleNodeClick = useCallback(() => {
        if (node.type === 'COURSE' || node.type === 'PROJECT') {
            onToggle(node.id);
        } else if (node.type === 'LESSON') {
            router.push(`/lms/lessons/${node.id}`);
        }
    }, [node.type, node.id, onToggle, router]);

    const getIcon = () => {
        switch (node.type) {
            case 'COURSE':
                return node.isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-blue-500" />
                ) : (
                    <Folder className="h-4 w-4 text-blue-500" />
                );
            case 'PROJECT':
                return node.isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-green-500" />
                ) : (
                    <Folder className="h-4 w-4 text-green-500" />
                );
            case 'LESSON':
                return <PlayCircle className="h-4 w-4 text-orange-500" />;
            default:
                return <FileText className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getTooltipText = () => {
        switch (node.type) {
            case 'COURSE':
                return `Course: ${node.title}${node.children?.length ? ` (${node.children.length} projects)` : ' (no projects)'}`;
            case 'PROJECT':
                return `Project: ${node.title}${node.children?.length ? ` (${node.children.length} lessons)` : ' (no lessons)'}`;
            case 'LESSON':
                return `Lesson: ${node.title}${node.lessonType ? ` (${node.lessonType})` : ''}`;
            default:
                return node.title;
        }
    };

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
                {(node.type === 'COURSE' || node.type === 'PROJECT') && (
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

                {/* Drag Handle (only in edit mode) */}
                {canEdit && (
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className={cn(
                            "h-4 w-4 text-muted-foreground",
                            isDragging ? "cursor-grabbing text-primary" : "cursor-grab"
                        )} />
                    </div>
                )}

                {/* Icon */}
                <div className="flex-shrink-0">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="cursor-pointer">
                                {getIcon()}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                            <p>{getTooltipText()}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0" onClick={handleNodeClick}>
                    <span className="text-sm font-medium truncate block">
                        {node.title}
                    </span>
                    {node.duration && (
                        <span className="text-xs text-muted-foreground">
                            {node.duration}min
                        </span>
                    )}
                </div>

                {/* Actions Menu (only for edit mode) */}
                {canEdit && (
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
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle edit
                                    }}
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle delete
                                    }}
                                    className="text-destructive"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Children */}
            {(node.type === 'COURSE' || node.type === 'PROJECT') &&
                node.isExpanded &&
                node.children && (
                    <div className="mt-1">
                        {node.children.map((child) => (
                            <LMSTreeNodeComponent
                                key={child.id}
                                node={child}
                                level={level + 1}
                                onToggle={onToggle}
                                onMove={onMove}
                                canEdit={canEdit}
                            />
                        ))}
                    </div>
                )}
        </div>
    );
}

// Main LMS Tree Sidebar Component
export function LMSTreeSidebar({ nodes, onNodesChange: _onNodesChange, canEdit = false }: LMSTreeSidebarProps) {
    const router = useRouter();
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

    const handleMove = useCallback(async (
        dragId: string,
        dropId: string,
        dropType: 'COURSE' | 'PROJECT' | 'LESSON',
        position: 'before' | 'after' | 'inside'
    ) => {
        try {
            let result;

            // Determine what type of move this is based on the drag item
            const dragNode = findNodeById(nodes, dragId);

            if (!dragNode) return;

            // Show loading toast
            const loadingToast = toast.loading('Moving item...');

            if (dragNode.type === 'LESSON') {
                // Moving a lesson
                let targetProjectId = dropId;
                let targetLessonId;

                if (dropType === 'LESSON') {
                    // Moving relative to another lesson
                    const targetLesson = findNodeById(nodes, dropId);
                    targetProjectId = targetLesson?.parentId || dropId;
                    targetLessonId = dropId;
                } else if (dropType === 'PROJECT') {
                    // Moving into a project
                    targetProjectId = dropId;
                }

                result = await moveLesson({
                    lessonId: dragId,
                    targetProjectId,
                    position: position === 'inside' ? undefined : position,
                    targetLessonId
                });
            } else if (dragNode.type === 'PROJECT') {
                // Moving a project
                let targetCourseId = dropId;
                let targetProjectId;

                if (dropType === 'PROJECT') {
                    // Moving relative to another project
                    const targetProject = findNodeById(nodes, dropId);
                    targetCourseId = targetProject?.parentId || dropId;
                    targetProjectId = dropId;
                } else if (dropType === 'COURSE') {
                    // Moving into a course
                    targetCourseId = dropId;
                }

                result = await moveProject({
                    projectId: dragId,
                    targetCourseId,
                    position: position === 'inside' ? undefined : position,
                    targetProjectId
                });
            }

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            if (result?.success) {
                // Show success message
                toast.success(result.message || 'Item moved successfully');

                // Refresh data while keeping tree view active
                router.refresh();
            } else {
                toast.error(result?.error || 'Failed to move item');
                console.error('Failed to move:', result?.error);
            }
        } catch (error) {
            toast.error('Failed to move item');
            console.error('Failed to move:', error);
        }
    }, [nodes, router]);

    // Helper function to find node by ID
    const findNodeById = (nodes: LMSTreeNode[], id: string): LMSTreeNode | null => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNodeById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    // Add expanded state to nodes
    const addExpandedState = (nodes: LMSTreeNode[]): LMSTreeNode[] => {
        return nodes.map(node => ({
            ...node,
            isExpanded: expandedNodes.has(node.id),
            children: node.children ? addExpandedState(node.children) : undefined
        }));
    };

    const nodesWithExpandedState = addExpandedState(nodes);

    return (
        <TooltipProvider>
            <div className="space-y-1">
                {/* Instructions for drag and drop */}
                {canEdit && nodesWithExpandedState.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div className="text-xs text-blue-700 dark:text-blue-300">
                                <p className="font-medium">Drag & Drop Instructions:</p>
                                <ul className="mt-1 space-y-0.5 text-xs">
                                    <li>• Drag lessons between projects</li>
                                    <li>• Drag projects between courses</li>
                                    <li>• Drop on items or between them</li>
                                    <li>• Edit mode stays active until you exit</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {nodesWithExpandedState.length > 0 ? (
                    nodesWithExpandedState.map((node) => (
                        <LMSTreeNodeComponent
                            key={node.id}
                            node={node}
                            level={0}
                            onToggle={toggleNode}
                            onMove={handleMove}
                            canEdit={canEdit}
                        />
                    ))
                ) : (
                    <div className="text-center py-8" role="status" aria-live="polite">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            No courses yet
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            Create your first course to get started
                        </p>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
} 