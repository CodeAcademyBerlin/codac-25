'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectSummaryEditorProps {
  projectId: string;
  initialValue?: string;
  onContentChange?: (content: string) => void;
  canEdit?: boolean;
  showStatusBar?: boolean;
}

export function ProjectSummaryEditor({
  projectId,
  initialValue = '',
  onContentChange,
  canEdit = true,
  showStatusBar = false,
}: ProjectSummaryEditorProps) {
  const [content, setContent] = React.useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="summary" className="block text-sm font-medium mb-2">
              Project Summary
            </label>
            <textarea
              id="summary"
              value={content}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="Describe your project..."
              className="w-full min-h-[200px] p-3 border rounded-md resize-vertical"
            />
          </div>
          {showStatusBar && (
            <div className="text-sm text-muted-foreground">
              Project ID: {projectId}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}