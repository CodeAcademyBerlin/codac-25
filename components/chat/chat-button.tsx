'use client'

import { MessageSquare, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { startDirectMessage } from '@/actions/chat/start-direct-message'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatButtonProps {
    userId: string
    userName?: string
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'sm' | 'default' | 'lg'
    className?: string
    showText?: boolean
}

export function ChatButton({ 
    userId, 
    userName, 
    variant = 'outline', 
    size = 'sm', 
    className,
    showText = true
}: ChatButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleStartChat = async () => {
        if (isLoading) return
        
        setIsLoading(true)
        try {
            const result = await startDirectMessage(userId)
            
            if (result.success && result.data?.conversationId) {
                // Navigate to the chat page with the conversation ID
                router.push(`/chat?conversation=${result.data.conversationId}`)
            } else {
                console.error('Failed to start chat:', result.error)
                // Fallback: navigate to general chat page
                router.push('/chat')
            }
        } catch (error) {
            console.error('Failed to start chat:', error)
            // Fallback: navigate to general chat page
            router.push('/chat')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button 
            variant={variant} 
            size={size} 
            className={cn(showText ? 'justify-start' : '', className)}
            onClick={handleStartChat}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className={cn('h-4 w-4 animate-spin', showText && 'mr-2')} />
            ) : (
                <MessageSquare className={cn('h-4 w-4', showText && 'mr-2')} />
            )}
            {showText && (
                <span>
                    {isLoading 
                        ? 'Starting chat...' 
                        : userName 
                            ? `Message ${userName}` 
                            : 'Send Message'
                    }
                </span>
            )}
            {!showText && (
                <span className="sr-only">
                    {isLoading 
                        ? 'Starting chat...' 
                        : userName 
                            ? `Message ${userName}` 
                            : 'Send Message'
                    }
                </span>
            )}
        </Button>
    )
}
