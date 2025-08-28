'use client'

import { formatDistanceToNow } from 'date-fns'
import { GitBranch, Star, Users, Eye, Calendar, Globe, Code } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { GitHubImportPreview, GitHubImportOptions } from '@/types/portfolio'

interface RepositoryPreviewCardProps {
  preview: GitHubImportPreview
  importOptions: GitHubImportOptions
  onImportOptionsChange: (options: GitHubImportOptions) => void
  onImport: () => void
  loading?: boolean
}

export function RepositoryPreviewCard({
  preview,
  importOptions,
  onImportOptionsChange,
  onImport,
  loading = false
}: RepositoryPreviewCardProps) {
  const toggleOption = (key: keyof GitHubImportOptions) => {
    onImportOptionsChange({
      ...importOptions,
      [key]: !importOptions[key]
    })
  }

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} KB`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} MB`
    return `${(size / (1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              {preview.title}
              {preview.isPrivate && (
                <Badge variant="secondary" className="text-xs">
                  Private
                </Badge>
              )}
              {preview.isArchived && (
                <Badge variant="outline" className="text-xs">
                  Archived
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {preview.description || 'No description provided'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Repository Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3 w-3" />
            {preview.stars.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            {preview.forks.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="h-3 w-3" />
            {formatFileSize(preview.size)}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(preview.lastUpdated, { addSuffix: true })}
          </div>
        </div>

        <Separator />

        {/* Tech Stack */}
        {preview.techStack && preview.techStack.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Code className="h-3 w-3" />
              Technologies Detected
            </h4>
            <div className="flex flex-wrap gap-1">
              {preview.techStack.slice(0, 10).map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {preview.techStack.length > 10 && (
                <Badge variant="outline" className="text-xs">
                  +{preview.techStack.length - 10} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Topics */}
        {preview.topics && preview.topics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Topics</h4>
            <div className="flex flex-wrap gap-1">
              {preview.topics.slice(0, 8).map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
              {preview.topics.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{preview.topics.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Demo URL */}
        {preview.demoUrl && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-3 w-3" />
              Live Demo
            </h4>
            <a
              href={preview.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {preview.demoUrl}
            </a>
          </div>
        )}

        {/* Features */}
        {preview.features && preview.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Features</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {preview.features.slice(0, 5).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-xs mt-1">•</span>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
              {preview.features.length > 5 && (
                <li className="text-xs text-muted-foreground">
                  +{preview.features.length - 5} more features...
                </li>
              )}
            </ul>
          </div>
        )}

        <Separator />

        {/* Import Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Import Options</h4>
          <div className="grid grid-cols-1 gap-2">
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={importOptions.importTitle}
                onChange={() => toggleOption('importTitle')}
                className="rounded"
              />
              <span>Import repository name as project title</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={importOptions.importDescription}
                onChange={() => toggleOption('importDescription')}
                className="rounded"
              />
              <span>Import repository description</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={importOptions.importTechStack}
                onChange={() => toggleOption('importTechStack')}
                className="rounded"
              />
              <span>Import detected tech stack ({preview.techStack.length} items)</span>
            </label>
            {preview.features && preview.features.length > 0 && (
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.importFeatures}
                  onChange={() => toggleOption('importFeatures')}
                  className="rounded"
                />
                <span>Import extracted features ({preview.features.length} items)</span>
              </label>
            )}
            {preview.demoUrl && (
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.importDemoUrl}
                  onChange={() => toggleOption('importDemoUrl')}
                  className="rounded"
                />
                <span>Import demo URL</span>
              </label>
            )}
            {preview.hasReadme && (
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.importReadmeSummary}
                  onChange={() => toggleOption('importReadmeSummary')}
                  className="rounded"
                />
                <span>Import README as project summary</span>
              </label>
            )}
          </div>
        </div>

        {/* Import Button */}
        <div className="flex justify-end pt-2">
          <Button onClick={onImport} disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Importing...' : 'Import Repository Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}