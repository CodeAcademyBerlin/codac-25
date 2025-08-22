'use client'

import { Edit, MoreHorizontal, Share, Trash } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface ProjectActionsProps {
  projectId: string
}

export function ProjectActions({ projectId }: ProjectActionsProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this project',
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/projects/${projectId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share className="h-4 w-4 mr-2" />
          Share Project
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash className="h-4 w-4 mr-2" />
          Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}