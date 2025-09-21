'use client'

import { GitBranch, Loader2, AlertCircle, Search, Github, User, Globe } from 'lucide-react'
import { useState, useTransition } from 'react'

import { fetchRepository } from '@/actions/github/fetch-repository'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { GitHubImportPreview, GitHubImportOptions, CreateProjectData } from '@/types/portfolio'

import { RepositoryPreviewCard } from './repository-preview-card'
import { RepositorySelector } from '@/components/github/repository-selector'

interface GitHubImportTabProps {
  onImport: (data: Partial<CreateProjectData>) => void
  onError?: (error: string) => void
}

export function GitHubImportTab({ onImport, onError }: GitHubImportTabProps) {
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<GitHubImportPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [importMode, setImportMode] = useState<'oauth' | 'url'>('oauth')

  const [importOptions, setImportOptions] = useState<GitHubImportOptions>({
    importTitle: true,
    importDescription: true,
    importTechStack: true,
    importFeatures: true,
    importDemoUrl: true,
    importReadmeSummary: true,
  })

  const handleFetchRepository = () => {
    if (!url.trim()) {
      setError('Please enter a GitHub repository URL')
      return
    }

    setError(null)
    setPreview(null)

    startTransition(async () => {
      try {
        const result = await fetchRepository({ url: url.trim() })

        if (!result.success) {
          const errorMessage = typeof result.error === 'string' ? result.error : 'Validation error occurred'
          setError(errorMessage)
          onError?.(errorMessage)
          return
        }

        // Convert ImportableProjectData to GitHubImportPreview
        const previewData: GitHubImportPreview = {
          title: result.data.title,
          description: result.data.description,
          shortDesc: result.data.shortDesc,
          githubUrl: result.data.githubUrl,
          demoUrl: result.data.demoUrl,
          techStack: result.data.techStack,
          features: result.data.features || [],
          stars: result.data.stars,
          forks: result.data.forks,
          size: result.data.size,
          language: result.data.language,
          topics: result.data.topics || [],
          lastUpdated: result.data.lastUpdated,
          isPrivate: result.data.isPrivate,
          isArchived: result.data.isArchived,
          hasReadme: !!result.data.readme,
          readmeSummary: result.data.readmeSummary,
        }

        setPreview(previewData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    })
  }

  const handleImport = () => {
    if (!preview) return

    const projectData: Partial<CreateProjectData> = {}

    // Apply import options
    if (importOptions.importTitle) {
      projectData.title = preview.title
    }

    if (importOptions.importDescription) {
      projectData.description = preview.description
      projectData.shortDesc = preview.shortDesc
    }

    if (importOptions.importTechStack) {
      projectData.techStack = preview.techStack
    }

    if (importOptions.importFeatures && preview.features) {
      projectData.features = preview.features
    }

    if (importOptions.importDemoUrl && preview.demoUrl) {
      projectData.demoUrl = preview.demoUrl
    }

    if (importOptions.importReadmeSummary && preview.readmeSummary) {
      projectData.summary = preview.readmeSummary
    }

    // Always import GitHub URL
    projectData.githubUrl = preview.githubUrl

    // Add GitHub import metadata
    projectData.githubImportData = {
      importedAt: new Date(),
      stars: preview.stars,
      forks: preview.forks,
      size: preview.size,
      language: preview.language,
      topics: preview.topics,
      lastUpdated: preview.lastUpdated,
    }

    onImport(projectData)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isPending) {
      handleFetchRepository()
    }
  }

  const handleRepositorySelect = async (repository: any) => {
    // Convert GitHub repository to the expected format for the existing system
    const repositoryUrl = repository.html_url
    setUrl(repositoryUrl)

    // Automatically fetch repository data when selected
    startTransition(async () => {
      try {
        const result = await fetchRepository({ url: repositoryUrl })

        if (!result.success) {
          const errorMessage = typeof result.error === 'string' ? result.error : 'Validation error occurred'
          setError(errorMessage)
          onError?.(errorMessage)
          return
        }

        // Convert ImportableProjectData to GitHubImportPreview
        const previewData: GitHubImportPreview = {
          title: result.data.title,
          description: result.data.description,
          shortDesc: result.data.shortDesc,
          githubUrl: result.data.githubUrl,
          demoUrl: result.data.demoUrl,
          techStack: result.data.techStack,
          features: result.data.features || [],
          stars: result.data.stars,
          forks: result.data.forks,
          size: result.data.size,
          language: result.data.language,
          topics: result.data.topics || [],
          lastUpdated: result.data.lastUpdated,
          isPrivate: result.data.isPrivate,
          isArchived: result.data.isArchived,
          hasReadme: !!result.data.readme,
          readmeSummary: result.data.readmeSummary,
        }

        setPreview(previewData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    })
  }

  const handleCreateProjectFromRepo = async (repository: any) => {
    // Convert to CreateProjectData format and import directly
    const projectData: Partial<CreateProjectData> = {
      title: repository.name.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: repository.description || `A ${repository.language || 'software'} project`,
      shortDesc: repository.description ?
        (repository.description.length > 150 ?
          repository.description.substring(0, 147) + '...' :
          repository.description
        ) : undefined,
      githubUrl: repository.html_url,
      demoUrl: repository.homepage || undefined,
      techStack: repository.language ? [repository.language] : [],
      status: 'COMPLETED',
      startDate: new Date(repository.created_at),
      endDate: new Date(repository.updated_at),
    }

    onImport(projectData)
  }

  return (
    <div className="space-y-6">
      <Tabs value={importMode} onValueChange={(value) => setImportMode(value as 'oauth' | 'url')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="oauth" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            My Repositories
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Any Repository
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oauth" className="mt-6">
          <RepositorySelector
            onRepositorySelect={handleRepositorySelect}
            onCreateProject={handleCreateProjectFromRepo}
            showCreateButton={true}
            className="w-full"
          />
        </TabsContent>

        <TabsContent value="url" className="mt-6">
          {/* GitHub URL Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Import from GitHub Repository URL
              </CardTitle>
              <CardDescription>
                Enter any public GitHub repository URL to automatically populate your project with repository data,
                including description, tech stack, and features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github-url">GitHub Repository URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="github-url"
                    placeholder="https://github.com/username/repository"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isPending}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleFetchRepository}
                    disabled={isPending || !url.trim()}
                    size="default"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-2">
                      {isPending ? 'Fetching...' : 'Fetch'}
                    </span>
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Example URLs */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Examples:</p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setUrl('https://github.com/facebook/react')}
                    className="text-xs text-blue-600 hover:underline block"
                    disabled={isPending}
                  >
                    https://github.com/facebook/react
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrl('https://github.com/vercel/next.js')}
                    className="text-xs text-blue-600 hover:underline block"
                    disabled={isPending}
                  >
                    https://github.com/vercel/next.js
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Repository Preview */}
      {preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Repository Preview</h3>
          </div>

          <RepositoryPreviewCard
            preview={preview}
            importOptions={importOptions}
            onImportOptionsChange={setImportOptions}
            onImport={handleImport}
            loading={false}
          />
        </div>
      )}

      {/* Loading State */}
      {isPending && !preview && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium">Fetching repository data...</span>
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-md">
                We&apos;re analyzing the repository to extract project information,
                tech stack, and features. This may take a few seconds.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!preview && !isPending && !error && (
        <Card>
          <CardContent className="py-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <Github className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">Import Your GitHub Repository</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Paste any public GitHub repository URL above to automatically populate your project
                details. We&apos;ll extract the name, description, tech stack, and features from your repository.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}