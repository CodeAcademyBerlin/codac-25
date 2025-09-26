'use client';



import { getCommentKey, getDraftCommentKey } from '@platejs/comment';
import { CommentPlugin, useCommentId } from '@platejs/comment/react';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
} from 'date-fns';
import {
  ArrowUpIcon,
  CheckIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from 'lucide-react';
import { type Value, KEYS, NodeApi } from 'platejs';
import type { CreatePlateEditorOptions } from 'platejs/react';
import {
  Plate,
  useEditorPlugin,
  useEditorRef,
  usePlateEditor,
  usePluginOption,
} from 'platejs/react';
import * as React from 'react';

import { BasicMarksKit } from '@/components/editor/plugins/basic-marks-kit';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { Editor, EditorContainer } from './editor';

// TODO: Implement discussion database plugin
const discussionDatabasePlugin = null;
const discussionDatabaseHelpers = null;


export interface TComment {
  id: string;
  contentRich: Value;
  createdAt: Date;
  discussionId: string;
  isEdited: boolean;
  userId: string;
}

export function CommentDatabase(props: {
  comment: TComment;
  discussionLength: number;
  editingId: string | null;
  index: number;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  documentContent?: string;
  showDocumentContent?: boolean;
  onEditorClick?: () => void;
}) {
  const {
    comment,
    discussionLength,
    documentContent,
    editingId,
    index,
    setEditingId,
    showDocumentContent = false,
    onEditorClick,
  } = props;

  const editor = useEditorRef();
  const userInfo = usePluginOption(
    discussionDatabasePlugin,
    'user',
    comment.userId
  );
  const currentUserId = usePluginOption(
    discussionDatabasePlugin,
    'currentUserId'
  );
  const { tf } = useEditorPlugin(CommentPlugin);

  const resolveDiscussion = async (id: string) => {
    try {
      const documentId = editor.getOption(
        discussionDatabasePlugin,
        'documentId'
      );

      await discussionDatabaseHelpers.resolveDiscussion(
        id,
        documentId,
        editor.setOption.bind(editor, discussionDatabasePlugin),
        editor.getOption.bind(editor, discussionDatabasePlugin)
      );
      tf.comment.unsetMark({ id });
    } catch (error) {
      console.error('Failed to resolve discussion:', error);
    }
  };

  const removeDiscussion = async (id: string) => {
    try {
      await discussionDatabaseHelpers.deleteComment(
        comment.id,
        editor.setOption.bind(editor, discussionDatabasePlugin),
        editor.getOption.bind(editor, discussionDatabasePlugin)
      );
      tf.comment.unsetMark({ id });
    } catch (error) {
      console.error('Failed to remove discussion:', error);
    }
  };

  const updateComment = async (input: {
    id: string;
    contentRich: Value;
    discussionId: string;
    isEdited: boolean;
  }) => {
    try {
      await discussionDatabaseHelpers.updateComment(
        input.id,
        input.contentRich,
        editor.setOption.bind(editor, discussionDatabasePlugin),
        editor.getOption.bind(editor, discussionDatabasePlugin)
      );
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  // Replace to your own backend or refer to potion
  const isMyComment = currentUserId === comment.userId;

  const initialValue = comment.contentRich;

  const commentEditor = useCommentEditor(
    {
      id: comment.id,
      value: initialValue,
    },
    [initialValue]
  );

  const onCancel = () => {
    setEditingId(null);
    commentEditor.tf.replaceNodes(initialValue, {
      at: [],
      children: true,
    });
  };

  const onSave = () => {
    void updateComment({
      id: comment.id,
      contentRich: commentEditor.children,
      discussionId: comment.discussionId,
      isEdited: true,
    });
    setEditingId(null);
  };

  const onResolveComment = () => {
    void resolveDiscussion(comment.discussionId);
  };

  const isFirst = index === 0;
  const isLast = index === discussionLength - 1;
  const isEditing = editingId && editingId === comment.id;

  const [hovering, setHovering] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className='relative flex items-center'>
        <Avatar className='size-5'>
          <AvatarImage alt={userInfo?.name} src={userInfo?.avatarUrl} />
          <AvatarFallback>{userInfo?.name?.[0]}</AvatarFallback>
        </Avatar>
        <h4 className='mx-2 text-sm leading-none font-semibold'>
          {/* Replace to your own backend or refer to potion */}
          {userInfo?.name}
        </h4>

        <div className='text-xs leading-none text-muted-foreground/80'>
          <span className='mr-1'>
            {formatCommentDate(new Date(comment.createdAt))}
          </span>
          {comment.isEdited && <span>(edited)</span>}
        </div>

        {isMyComment && (hovering || dropdownOpen) && (
          <div className='absolute top-0 right-0 flex space-x-1'>
            {index === 0 && (
              <Button
                variant='ghost'
                className='h-6 p-1 text-muted-foreground'
                onClick={onResolveComment}
                type='button'
              >
                <CheckIcon className='size-4' />
              </Button>
            )}

            <CommentMoreDropdown
              onCloseAutoFocus={() => {
                setTimeout(() => {
                  commentEditor.tf.focus({ edge: 'endEditor' });
                }, 0);
              }}
              onRemoveComment={() => {
                if (discussionLength === 1) {
                  tf.comment.unsetMark({ id: comment.discussionId });
                  void removeDiscussion(comment.discussionId);
                }
              }}
              comment={comment}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              setEditingId={setEditingId}
            />
          </div>
        )}
      </div>

      {isFirst && showDocumentContent && (
        <div className='text-subtle-foreground relative mt-1 flex pl-[32px] text-sm'>
          {discussionLength > 1 && (
            <div className='absolute top-[5px] left-3 h-full w-0.5 shrink-0 bg-muted' />
          )}
          <div className='my-px w-0.5 shrink-0 bg-highlight' />
          {documentContent && <div className='ml-2'>{documentContent}</div>}
        </div>
      )}

      <div className='relative my-1 pl-[26px]'>
        {!isLast && (
          <div className='absolute top-0 left-3 h-full w-0.5 shrink-0 bg-muted' />
        )}
        <Plate readOnly={!isEditing} editor={commentEditor}>
          <EditorContainer variant='comment'>
            <Editor
              variant='comment'
              className='w-auto grow'
              onClick={() => onEditorClick?.()}
            />

            {isEditing && (
              <div className='ml-auto flex shrink-0 gap-1'>
                <Button
                  size='icon'
                  variant='ghost'
                  className='size-[28px]'
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    void onCancel();
                  }}
                >
                  <div className='flex size-5 shrink-0 items-center justify-center rounded-[50%] bg-primary/40'>
                    <XIcon className='size-3 stroke-[3px] text-background' />
                  </div>
                </Button>

                <Button
                  size='icon'
                  variant='ghost'
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    void onSave();
                  }}
                >
                  <div className='flex size-5 shrink-0 items-center justify-center rounded-[50%] bg-brand'>
                    <CheckIcon className='size-3 stroke-[3px] text-background' />
                  </div>
                </Button>
              </div>
            )}
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}

function CommentMoreDropdown(props: {
  comment: TComment;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  onCloseAutoFocus?: () => void;
  onRemoveComment?: () => void;
}) {
  const {
    comment,
    dropdownOpen,
    setDropdownOpen,
    setEditingId,
    onCloseAutoFocus,
    onRemoveComment,
  } = props;

  const editor = useEditorRef();

  const selectedEditCommentRef = React.useRef<boolean>(false);

  const onDeleteComment = React.useCallback(async () => {
    if (!comment.id)
      return alert('You are operating too quickly, please try again later.');

    try {
      await discussionDatabaseHelpers.deleteComment(
        comment.id,
        editor.setOption.bind(editor, discussionDatabasePlugin),
        editor.getOption.bind(editor, discussionDatabasePlugin)
      );
      onRemoveComment?.();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  }, [comment.id, editor, onRemoveComment]);

  const onEditComment = React.useCallback(() => {
    selectedEditCommentRef.current = true;

    if (!comment.id)
      return alert('You are operating too quickly, please try again later.');

    setEditingId(comment.id);
  }, [comment.id, setEditingId]);

  return (
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      modal={false}
    >
      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
        <Button variant='ghost' className={cn('h-6 p-1 text-muted-foreground')}>
          <MoreHorizontalIcon className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-48'
        onCloseAutoFocus={e => {
          if (selectedEditCommentRef.current) {
            onCloseAutoFocus?.();
            selectedEditCommentRef.current = false;
          }

          return e.preventDefault();
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEditComment}>
            <PencilIcon className='size-4' />
            Edit comment
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteComment}>
            <TrashIcon className='size-4' />
            Delete comment
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const useCommentEditor = (
  options: Omit<CreatePlateEditorOptions, 'plugins'> = {},
  deps: any[] = []
) => {
  const commentEditor = usePlateEditor(
    {
      id: 'comment',
      plugins: BasicMarksKit,
      value: [],
      ...options,
    },
    deps
  );

  return commentEditor;
};

export function CommentCreateFormDatabase({
  autoFocus = false,
  className,
  discussionId: discussionIdProp,
  focusOnMount = false,
}: {
  autoFocus?: boolean;
  className?: string;
  discussionId?: string;
  focusOnMount?: boolean;
}) {
  // const discussions = usePluginOption(discussionDatabasePlugin, 'discussions');

  const editor = useEditorRef();
  const commentId = useCommentId();
  const discussionId = discussionIdProp ?? commentId;

  const userInfo = usePluginOption(discussionDatabasePlugin, 'currentUser');
  const [commentValue, setCommentValue] = React.useState<Value | undefined>();
  const commentContent = React.useMemo(
    () =>
      commentValue
        ? NodeApi.string({ children: commentValue, type: KEYS.p })
        : '',
    [commentValue]
  );
  const commentEditor = useCommentEditor();

  React.useEffect(() => {
    if (commentEditor && focusOnMount) {
      commentEditor.tf.focus();
    }
  }, [commentEditor, focusOnMount]);

  const onAddComment = React.useCallback(async () => {
    if (!commentValue) return;

    commentEditor.tf.reset();

    if (discussionId) {
      // Add reply to existing discussion
      try {
        const documentId = editor.getOption(
          discussionDatabasePlugin,
          'documentId'
        );
        const currentUserId = editor.getOption(
          discussionDatabasePlugin,
          'currentUserId'
        );
        const currentUser = editor.getOption(
          discussionDatabasePlugin,
          'currentUser'
        );

        await discussionDatabaseHelpers.addReply(
          discussionId,
          commentValue,
          documentId,
          currentUserId,
          currentUser,
          editor.setOption.bind(editor, discussionDatabasePlugin),
          editor.getOption.bind(editor, discussionDatabasePlugin)
        );
      } catch (error) {
        console.error('Failed to add reply:', error);
        alert('Failed to add reply. Please try again.');
      }
      return;
    }

    const commentsNodeEntry = editor
      .getApi(CommentPlugin)
      .comment.nodes({ at: [], isDraft: true });

    if (commentsNodeEntry.length === 0) return;

    const documentContent = commentsNodeEntry
      .map(([node]) => node.text)
      .join('');

    try {
      // Create new discussion
      const documentId = editor.getOption(
        discussionDatabasePlugin,
        'documentId'
      );
      const currentUserId = editor.getOption(
        discussionDatabasePlugin,
        'currentUserId'
      );
      const currentUser = editor.getOption(
        discussionDatabasePlugin,
        'currentUser'
      );

      const _discussionId = await discussionDatabaseHelpers.createDiscussion(
        documentContent,
        commentValue,
        documentId,
        currentUserId,
        currentUser,
        editor.setOption.bind(editor, discussionDatabasePlugin),
        editor.getOption.bind(editor, discussionDatabasePlugin)
      );

      if (_discussionId) {
        const id = _discussionId;

        commentsNodeEntry.forEach(([, path]) => {
          editor.tf.setNodes(
            {
              [getCommentKey(id)]: true,
            },
            { at: path, split: true }
          );
          editor.tf.unsetNodes([getDraftCommentKey()], { at: path });
        });
      }
    } catch (error) {
      console.error('Failed to create discussion:', error);
      alert('Failed to create discussion. Please try again.');
    }
  }, [commentValue, commentEditor.tf, discussionId, editor]);

  return (
    <div className={cn('flex w-full', className)}>
      <div className='mt-2 mr-1 shrink-0'>
        {/* Replace to your own backend or refer to potion */}
        <Avatar className='size-5'>
          <AvatarImage alt={userInfo?.name} src={userInfo?.avatarUrl} />
          <AvatarFallback>{userInfo?.name?.[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className='relative flex grow gap-2'>
        <Plate
          onChange={({ value }) => {
            setCommentValue(value);
          }}
          editor={commentEditor}
        >
          <EditorContainer variant='comment'>
            <Editor
              variant='comment'
              className='min-h-[25px] grow pt-0.5 pr-8'
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onAddComment();
                }
              }}
              placeholder='Reply...'
              autoComplete='off'
              autoFocus={autoFocus}
            />

            <Button
              size='icon'
              variant='ghost'
              className='absolute right-0.5 bottom-0.5 ml-auto size-6 shrink-0'
              disabled={commentContent.trim().length === 0}
              onClick={e => {
                e.stopPropagation();
                onAddComment();
              }}
            >
              <div className='flex size-6 items-center justify-center rounded-full'>
                <ArrowUpIcon />
              </div>
            </Button>
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}

export const formatCommentDate = (date: Date) => {
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  if (diffDays < 2) {
    return `${diffDays}d`;
  }

  return format(date, 'MM/dd/yyyy');
};
