'use client';

import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface SuggestionChipsProps {
    suggestions: string[];
    onSuggestionClick: (suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onSuggestionClick }: SuggestionChipsProps) {
    if (suggestions.length === 0) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lightbulb className="h-4 w-4" />
                <span>Suggested follow-up questions:</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-auto py-2 px-3 text-xs font-normal whitespace-normal text-left justify-start"
                        onClick={() => onSuggestionClick(suggestion)}
                    >
                        {suggestion}
                    </Button>
                ))}
            </div>
        </div>
    );
}
