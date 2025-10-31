'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';
import { toast } from 'sonner';

interface CopyButtonProps {
    text: string;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function CopyButton({
    text,
    className,
    variant = 'outline',
    size = 'default',
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    return (
        <Button
            onClick={handleCopy}
            variant={variant}
            size={size}
            className={className}
        >
            {copied ? (
                <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                </>
            ) : (
                <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                </>
            )}
        </Button>
    );
}

