'use client'

import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { likeProject } from '@/actions/projects/like-project'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProjectLikeButtonProps {
  projectId: string
  initialIsLiked: boolean
  initialLikesCount: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  variant?: 'button' | 'icon'
  className?: string
}

export function ProjectLikeButton({
  projectId,
  initialIsLiked,
  initialLikesCount,
  size = 'md',
  showCount = true,
  variant = 'button',
  className
}: ProjectLikeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isPending, startTransition] = useTransition()

  const handleLike = async () => {
    if (!session?.user) {
      toast.error('Please sign in to like projects')
      return
    }

    // Optimistic update
    const wasLiked = isLiked
    const previousCount = likesCount

    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)

    startTransition(async () => {
      try {
        const result = await likeProject({ projectId })

        if (!result.success) {
          // Revert optimistic update on error
          setIsLiked(wasLiked)
          setLikesCount(previousCount)
          toast.error(typeof result.error === 'string' ? result.error : 'Failed to like project')
          return
        }

        // Update based on server response
        setIsLiked(result.data.liked)

        // Show feedback
        toast.success(result.data.liked ? 'Project liked!' : 'Project unliked')
        
        // Refresh the page data to ensure consistency
        router.refresh()

      } catch {
        // Revert optimistic update on error
        setIsLiked(wasLiked)
        setLikesCount(previousCount)
        toast.error('Failed to like project')
      }
    })
  }

  const sizeClasses = {
    sm: {
      button: 'h-7 px-2 text-xs',
      icon: 'h-7 w-7 p-0',
      heart: 'h-3 w-3',
    },
    md: {
      button: 'h-8 px-3 text-sm',
      icon: 'h-8 w-8 p-0',
      heart: 'h-4 w-4',
    },
    lg: {
      button: 'h-9 px-4 text-sm',
      icon: 'h-9 w-9 p-0',
      heart: 'h-5 w-5',
    },
  }

  const currentSize = sizeClasses[size]

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          currentSize.icon,
          'hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50',
          isLiked && 'text-red-500',
          className
        )}
        onClick={handleLike}
        disabled={isPending}
      >
        <Heart
          className={cn(
            currentSize.heart,
            isLiked && 'fill-current',
            isPending && 'animate-pulse'
          )}
        />
        <span className="sr-only">
          {isLiked ? 'Unlike project' : 'Like project'}
        </span>
      </Button>
    )
  }

  return (
    <Button
      variant={isLiked ? 'secondary' : 'ghost'}
      size="sm"
      className={cn(
        currentSize.button,
        'gap-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50',
        isLiked && 'text-red-500 bg-red-50 dark:bg-red-950/50',
        className
      )}
      onClick={handleLike}
      disabled={isPending}
    >
      <Heart
        className={cn(
          currentSize.heart,
          isLiked && 'fill-current',
          isPending && 'animate-pulse'
        )}
      />
      {showCount && (
        <span className={cn(isPending && 'animate-pulse')}>
          {likesCount}
        </span>
      )}
      <span className="sr-only">
        {isLiked ? 'Unlike project' : 'Like project'}
      </span>
    </Button>
  )
}