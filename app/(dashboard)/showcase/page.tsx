import { Trophy, Star, TrendingUp, Users } from 'lucide-react'

import { Grid, PageContainer, PageHeader, Section, SectionHeader, StatsGrid } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectCard } from '@/components/projects/project-card'
import { getProjectStats } from '@/data/projects/get-project-stats'
import { getFeaturedProjects, getAllProjects } from '@/data/projects/get-projects'

export default async function ShowcasePage() {
  const [featuredProjects, recentProjects, stats] = await Promise.all([
    getFeaturedProjects(6),
    getAllProjects({ featured: false }),
    getProjectStats()
  ])

  const topProjects = recentProjects
    .sort((a, b) => (b.likes + b.views + b._count.comments) - (a.likes + a.views + a._count.comments))
    .slice(0, 6)

  return (
    <PageContainer>
      <PageHeader
        title="Project Showcase"
        description="Discover the most impressive projects from our community"
        size="lg"
      />

      {/* Stats Overview */}
      <Section>
        <StatsGrid>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                Across all students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Projects</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.featuredProjects}</div>
              <p className="text-xs text-muted-foreground">
                Highlighted by community
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
              <p className="text-xs text-muted-foreground">
                Building amazing projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                New projects added
              </p>
            </CardContent>
          </Card>
        </StatsGrid>
      </Section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <Section>
          <SectionHeader
            title="Featured Projects"
            description="Exceptional work highlighted by our community"
            badge={
              <Badge variant="secondary" className="text-sm">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            }
          />

          <Grid cols="3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </Grid>
        </Section>
      )}

      {/* Trending Projects */}
      {topProjects.length > 0 && (
        <Section>
          <SectionHeader
            title="Trending Projects"
            description="Most popular projects in the community right now"
            badge={
              <Badge variant="secondary" className="text-sm">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            }
          />

          <Grid cols="3">
            {topProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </Grid>
        </Section>
      )}

      {/* Empty State */}
      {featuredProjects.length === 0 && topProjects.length === 0 && (
        <Section>
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects to showcase yet</h3>
            <p className="text-muted-foreground">
              Be the first to create an amazing project for the community!
            </p>
          </div>
        </Section>
      )}
    </PageContainer>
  )
}