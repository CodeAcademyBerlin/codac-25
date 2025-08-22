'use client'

import { type Value } from 'platejs'
import React from 'react'

import { PlateEditor } from '@/components/editor/plate-editor'

interface ProjectSummaryDisplayProps {
  summary?: Value | null
  fallbackDescription?: string
  className?: string
}

export function ProjectSummaryDisplay({
  summary,
  fallbackDescription,
  className = "prose prose-sm max-w-none"
}: ProjectSummaryDisplayProps) {
  // If no summary exists, show fallback description or nothing
  if (!summary || !Array.isArray(summary) || summary.length === 0) {
    if (fallbackDescription) {
      return (
        <div className={className}>
          <p className="text-muted-foreground">{fallbackDescription}</p>
        </div>
      )
    }
    return null
  }

  // Check if summary is just empty or placeholder content
  if (isEmptySummary(summary)) {
    if (fallbackDescription) {
      return (
        <div className={className}>
          <p className="text-muted-foreground">{fallbackDescription}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={className}>
      <PlateEditor
        initialValue={summary}
        readOnly={true}
      />
    </div>
  )
}

// Helper function to check if summary contains actual content
function isEmptySummary(summary: Value): boolean {
  if (!summary || summary.length === 0) return true

  // Check if it's just empty paragraphs or placeholder text
  for (const node of summary) {
    if (node.type === 'p') {
      const text = node.children?.[0]?.text
      if (text && typeof text === 'string' && text.trim() !== '' &&
        text !== 'Tell the story of your project...' &&
        text !== 'Tell your project story...') {
        return false // Found actual content
      }
    } else if (node.type !== 'p') {
      // Any non-paragraph content counts as actual content
      return false
    }
  }

  return true // Only found empty or placeholder content
}