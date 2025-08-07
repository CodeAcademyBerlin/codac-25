'use client';

import { cn } from '@/lib/utils';

interface TypingAnimationProps {
    className?: string;
}

export function TypingAnimation({ className }: TypingAnimationProps) {
    return (
        <div className={cn('flex items-center space-x-1', className)}>
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
            </div>
        </div>
    );
}
