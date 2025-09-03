'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { ProjectStatus } from '@prisma/client'
import { CalendarIcon, PlusIcon, X, FileText, Github } from 'lucide-react'
import { type Value } from 'platejs'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { PROJECT_STATUSES, type CreateProjectData, type ProjectCreationMode } from '@/types/portfolio'

import { GitHubImportTab } from './github-import-tab'
import { ProjectSummaryEditor } from './project-summary-editor'

// Validation schema
const projectFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  shortDesc: z.string().max(150, 'Short description too long').optional(),
  demoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  techStack: z.array(z.string()).min(1, 'At least one technology is required'),
  features: z.array(z.string()).optional(),
  challenges: z.string().max(1000, 'Challenges too long').optional(),
  solutions: z.string().max(1000, 'Solutions too long').optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'ARCHIVED']),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isPublic: z.boolean(),
})

type ProjectFormData = z.infer<typeof projectFormSchema>

interface ProjectFormWithSummaryProps {
  projectId?: string // For editing existing projects
  initialData?: Partial<CreateProjectData>
  initialSummary?: Value
  onSubmit: (data: CreateProjectData) => Promise<void | { error: string }>
  onSummaryChange?: (summary: Value) => void
  isLoading?: boolean
}

export function ProjectFormWithSummary({
  projectId,
  initialData,
  initialSummary,
  onSubmit,
  onSummaryChange,
  isLoading = false,
}: ProjectFormWithSummaryProps) {
  const [summary, setSummary] = useState<Value | undefined>(initialSummary)
  const [newTech, setNewTech] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [creationMode, setCreationMode] = useState<ProjectCreationMode>('manual')
  const [importedData, setImportedData] = useState<Partial<CreateProjectData> | null>(null)

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      shortDesc: initialData?.shortDesc || '',
      demoUrl: initialData?.demoUrl || '',
      githubUrl: initialData?.githubUrl || '',
      techStack: initialData?.techStack || [],
      features: initialData?.features || [],
      challenges: initialData?.challenges || '',
      solutions: initialData?.solutions || '',
      status: (initialData?.status as ProjectStatus) || 'IN_PROGRESS',
      startDate: initialData?.startDate || undefined,
      endDate: initialData?.endDate || undefined,
      isPublic: initialData?.isPublic ?? true,
    },
  })

  const handleSummaryChange = (newSummary: Value) => {
    setSummary(newSummary)
    onSummaryChange?.(newSummary)
  }

  const handleGitHubImport = (data: Partial<CreateProjectData>) => {
    setImportedData(data)

    // Update form with imported data
    if (data.title) {
      form.setValue('title', data.title)
    }
    if (data.description) {
      form.setValue('description', data.description)
    }
    if (data.shortDesc) {
      form.setValue('shortDesc', data.shortDesc)
    }
    if (data.githubUrl) {
      form.setValue('githubUrl', data.githubUrl)
    }
    if (data.demoUrl) {
      form.setValue('demoUrl', data.demoUrl)
    }
    if (data.techStack) {
      form.setValue('techStack', data.techStack)
    }
    if (data.features) {
      form.setValue('features', data.features)
    }

    // Update summary if README was imported
    if (data.summary) {
      setSummary(data.summary)
    }

    // Switch to manual mode for editing
    setCreationMode('manual')

    const hasReadme = !!data.summary
    toast.success(`Repository data imported successfully! ${hasReadme ? 'README has been converted to project summary.' : ''} You can now edit the details before saving.`)
  }

  const handleImportError = (error: string) => {
    toast.error(`Import failed: ${error}`)
  }

  // Update form when imported data changes
  useEffect(() => {
    if (importedData && creationMode === 'manual') {
      // This effect ensures the form stays in sync with imported data
      // if the user switches back to manual mode
    }
  }, [importedData, creationMode, form])

  const handleSubmit = async (data: ProjectFormData) => {
    const submitData: CreateProjectData = {
      ...data,
      summary,
      techStack: data.techStack,
      features: data.features?.filter(f => f.trim() !== ''),
      // Include GitHub import metadata if available
      githubImportData: importedData?.githubImportData,
    }
    await onSubmit(submitData)
  }

  const addTechnology = () => {
    if (newTech.trim() && !form.getValues('techStack').includes(newTech.trim())) {
      const currentTech = form.getValues('techStack')
      form.setValue('techStack', [...currentTech, newTech.trim()])
      setNewTech('')
    }
  }

  const removeTechnology = (tech: string) => {
    const currentTech = form.getValues('techStack')
    form.setValue('techStack', currentTech.filter(t => t !== tech))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = form.getValues('features') || []
      form.setValue('features', [...currentFeatures, newFeature.trim()])
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues('features') || []
    form.setValue('features', currentFeatures.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8">
      {/* Creation Mode Selector - only show for new projects */}
      {!projectId && (
        <Card>
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
            <CardDescription>
              Choose how you&apos;d like to create your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={creationMode} onValueChange={(value) => setCreationMode(value as ProjectCreationMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="github-import" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  Import from GitHub
                </TabsTrigger>
              </TabsList>

              <TabsContent value="github-import" className="mt-6">
                <GitHubImportTab
                  onImport={handleGitHubImport}
                  onError={handleImportError}
                />
              </TabsContent>

              <TabsContent value="manual" className="mt-6">
                {importedData && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      ✅ Data imported from GitHub repository. You can now edit the details below.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Project Form - only show in manual mode or for existing projects */}
      {(creationMode === 'manual' || projectId) && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Core details about your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of your project"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be used for project cards and previews
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortDesc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="One-line summary for cards" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Project Links */}
            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
                <CardDescription>
                  Share your project with the world
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="demoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Demo URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://myproject.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Link to live demo or deployed version
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/username/repo" {...field} />
                      </FormControl>
                      <FormDescription>
                        Link to your project&apos;s source code
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
                <CardDescription>
                  Technologies and features of your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tech Stack */}
                <FormField
                  control={form.control}
                  name="techStack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tech Stack</FormLabel>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., React, Node.js, PostgreSQL"
                            value={newTech}
                            onChange={(e) => setNewTech(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addTechnology()
                              }
                            }}
                          />
                          <Button type="button" onClick={addTechnology} size="sm">
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((tech) => (
                            <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                              {tech}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeTechnology(tech)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Features */}
                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Features (Optional)</FormLabel>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., User authentication, Real-time chat"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addFeature()
                              }
                            }}
                          />
                          <Button type="button" onClick={addFeature} size="sm">
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {field.value?.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <span>• {feature}</span>
                              <X
                                className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive"
                                onClick={() => removeFeature(index)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Project Status & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Timeline</CardTitle>
                <CardDescription>
                  Current status and project timeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROJECT_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <span className={`text-${status.color}-600`}>
                                {status.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  field.value.toLocaleDateString()
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  field.value.toLocaleDateString()
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < (form.getValues('startDate') || new Date("1900-01-01")) || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (projectId ? 'Update Project' : 'Create Project')}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Project Summary Section - only show in manual mode or for existing projects */}
      {(creationMode === 'manual' || projectId) && (
        <Card>
          <CardHeader>
            <CardTitle>Project Summary</CardTitle>
            <CardDescription>
              Write a detailed summary using our rich text editor. This is where you can tell the full story of your project with formatting, images, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectId ? (
              <ProjectSummaryEditor
                projectId={projectId}
                initialValue={summary}
                onContentChange={handleSummaryChange}
                canEdit={true}
                showStatusBar={true}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Save your project first to enable the rich text summary editor</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}