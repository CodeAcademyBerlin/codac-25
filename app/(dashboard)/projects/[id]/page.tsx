import { Heart, ExternalLink, Github, Calendar, Eye } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Value } from 'platejs'

import { PageContainer } from '@/components/layout'
import { ProjectActions } from '@/components/projects/project-actions'
import { ProjectSummaryDisplay } from '@/components/projects/project-summary-display'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getProjectById } from '@/data/projects/get-project-by-id'
import { getCurrentUser } from '@/lib/auth/auth-utils'
import { PROJECT_STATUSES } from '@/types/portfolio'

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const [project, user] = await Promise.all([
    getProjectById(id),
    getCurrentUser()
  ])

  if (!project) {
    notFound()
  }

  const isOwner = user?.id === project.projectProfile.userId
  const statusConfig = PROJECT_STATUSES.find(s => s.value === project.status)

  return (
    <PageContainer size="lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                {project.shortDesc && (
                  <p className="text-lg text-muted-foreground">{project.shortDesc}</p>
                )}
              </div>
              {isOwner && <ProjectActions projectId={project.id} />}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={project.projectProfile.user.avatar || ''} />
                  <AvatarFallback>
                    {project.projectProfile.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/community/students/${project.projectProfile.userId}`}
                  className="hover:underline"
                >
                  {project.projectProfile.user.name || 'Anonymous'}
                </Link>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {project.createdAt.toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {project.views} views
              </div>
            </div>
          </div>

          {/* Project Links */}
          {(project.demoUrl || project.githubUrl) && (
            <div className="flex gap-3">
              {project.demoUrl && (
                <Button asChild>
                  <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live Demo
                  </Link>
                </Button>
              )}
              {project.githubUrl && (
                <Button variant="outline" asChild>
                  <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    View Code
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Project Summary */}
          <Card>
            <CardHeader>
              <CardTitle>About This Project</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectSummaryDisplay
                summary={project.summary as Value | null}
                fallbackDescription={project.description}
              />
            </CardContent>
          </Card>

          {/* Features */}
          {project.features && Array.isArray(project.features) && project.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(project.features as string[]).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Challenges & Solutions */}
          {(project.challenges || project.solutions) && (
            <Card>
              <CardHeader>
                <CardTitle>Development Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.challenges && (
                  <div>
                    <h4 className="font-semibold mb-2">Challenges</h4>
                    <p className="text-muted-foreground">{project.challenges}</p>
                  </div>
                )}
                {project.solutions && (
                  <div>
                    <h4 className="font-semibold mb-2">Solutions</h4>
                    <p className="text-muted-foreground">{project.solutions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Status</div>
                <Badge variant={statusConfig?.color === 'green' ? 'default' : 'secondary'}>
                  {statusConfig?.label || project.status}
                </Badge>
              </div>

              {(project.startDate || project.endDate) && (
                <div>
                  <div className="text-sm font-medium mb-1">Timeline</div>
                  <div className="text-sm text-muted-foreground">
                    {project.startDate && (
                      <div>Started: {project.startDate.toLocaleDateString()}</div>
                    )}
                    {project.endDate && (
                      <div>Completed: {project.endDate.toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium mb-2">Tech Stack</div>
                <div className="flex flex-wrap gap-2">
                  {(project.techStack as string[]).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{project.likes} likes</span>
                </div>
                <Button size="sm" variant="outline">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              <div className="text-sm">
                <div className="font-medium mb-1">Share this project</div>
                <div className="text-muted-foreground">
                  Help others discover this amazing work
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}