'use client'

import { FileText, Code, Palette, Search } from 'lucide-react'
import { type Value } from 'platejs'
import React, { useState } from 'react'

import { SimplifiedUnifiedEditor } from '@/components/editor/simplified-unified-editor'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PROJECT_SUMMARY_TEMPLATES, type ProjectSummaryTemplate } from '@/types/portfolio'

interface ProjectSummaryEditorProps {
  projectId: string
  initialValue?: Value
  onContentChange?: (content: Value) => void
  canEdit?: boolean
  readOnly?: boolean
  showStatusBar?: boolean
}

export function ProjectSummaryEditor({
  projectId,
  initialValue,
  onContentChange,
  canEdit = true,
  readOnly = false,
  showStatusBar = true,
}: ProjectSummaryEditorProps) {
  const [content, setContent] = useState<Value>(initialValue || getDefaultContent())
  const [showTemplates, setShowTemplates] = useState(!initialValue || isContentEmpty(initialValue))

  const handleTemplateSelect = (template: ProjectSummaryTemplate) => {
    setContent(template.content as unknown as Value)
    onContentChange?.(template.content as unknown as Value)
    setShowTemplates(false)
  }



  if (showTemplates && canEdit && !readOnly) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Choose a template to get started</h3>
          <p className="text-muted-foreground mb-6">
            Pick a template that matches your project type, or start with a blank canvas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECT_SUMMARY_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-2">
                  {template.icon === 'file-text' && <FileText className="h-8 w-8 text-muted-foreground" />}
                  {template.icon === 'code' && <Code className="h-8 w-8 text-blue-500" />}
                  {template.icon === 'palette' && <Palette className="h-8 w-8 text-purple-500" />}
                  {template.icon === 'search' && <Search className="h-8 w-8 text-green-500" />}
                </div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => setShowTemplates(false)}>
            Skip Templates - Start Writing
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {canEdit && !readOnly && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Project Summary</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Change Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Choose a Template</DialogTitle>
                <DialogDescription>
                  Select a new template for your project summary. This will replace your current content.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {PROJECT_SUMMARY_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-2">
                        {template.icon === 'file-text' && <FileText className="h-8 w-8 text-muted-foreground" />}
                        {template.icon === 'code' && <Code className="h-8 w-8 text-blue-500" />}
                        {template.icon === 'palette' && <Palette className="h-8 w-8 text-purple-500" />}
                        {template.icon === 'search' && <Search className="h-8 w-8 text-green-500" />}
                      </div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="min-h-[400px] border rounded-lg">
        <SimplifiedUnifiedEditor
          initialValue={content}
          contentId={projectId}
          contentType="project"
          showStatusBar={showStatusBar}
          canEdit={canEdit}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}

// Helper function to get default content for empty summary
function getDefaultContent(): Value {
  return [
    {
      type: 'p',
      children: [{ text: 'Tell the story of your project...' }],
    },
  ]
}

// Helper function to check if content is empty or just default
function isContentEmpty(content: Value): boolean {
  if (!content || content.length === 0) return true

  // Check if it's just the default placeholder
  if (content.length === 1 && content[0].type === 'p') {
    const text = content[0].children?.[0]?.text
    return !text || (typeof text === 'string' && text.trim() === '') || text === 'Tell the story of your project...'
  }

  return false
}