'use client';

import { Calendar, Edit, MoreVertical, Share, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

import { ServerDocumentViewer } from '@/components/editor/document-static-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DocumentWithPlateContent } from '@/data/documents/get-document';

interface DocumentPreviewProps {
  _documentPromise: Promise<DocumentWithPlateContent | null>;
}

export function DocumentPreview({ _documentPromise }: DocumentPreviewProps) {
  const document = use(_documentPromise);

  if (!document) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <h3 className='text-lg font-medium mb-2'>Document not found</h3>
          <p className='text-muted-foreground'>
            The document you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Document Header */}
      <div className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10'>
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <h1 className='text-xl font-semibold truncate'>
                {document.title || 'Untitled Document'}
              </h1>
              {document.isPublished && (
                <Badge variant='outline' className='text-xs'>
                  Published
                </Badge>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              <Share className='h-4 w-4 mr-2' />
              Share
            </Button>
            <Button size='sm' asChild>
              <Link href={`/documents/${document.id}`}>
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem asChild>
                  <Link href={`/documents/${document.id}`}>
                    <Edit className='h-4 w-4 mr-2' />
                    Edit Document
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className='h-4 w-4 mr-2' />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='text-destructive'>
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className='flex-1 overflow-y-auto'>
        <div className='max-w-4xl mx-auto p-6'>
          {/* Document Metadata */}
          <div className='mb-6 p-4 bg-muted/50 rounded-lg'>
            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>
                  Created: {new Date(document.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>
                  Updated: {new Date(document.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span>Version: {document.version}</span>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className='prose prose-sm max-w-none'>
            {document.description && (
              <div className='mb-6 p-4 bg-muted/30 rounded-lg'>
                <p className='text-muted-foreground italic'>
                  {document.description}
                </p>
              </div>
            )}

            {/* Document content rendered statically using Plate */}
            <div className='border rounded-lg'>
              <div className='p-6'>
                <ServerDocumentViewer
                  document={document}
                  className='prose max-w-none'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
