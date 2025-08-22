import { Users, Trophy, Plus, Code, Star } from "lucide-react";
import Link from 'next/link';
import { redirect } from "next/navigation";

import { PageErrorBoundary, SectionErrorBoundary } from "@/components/error";
import { Grid, PageContainer, PageHeader, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "@/components/projects/project-card";
import { getProjectStats } from '@/data/projects/get-project-stats';
import { getFeaturedProjects } from '@/data/projects/get-projects';
import { getUserProjects } from '@/data/projects/get-user-projects';
import { getUser } from "@/data/user/get-user";
import { auth } from "@/lib/auth/auth";



export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const result = await getUser(session.user.id);

  if (!result.success || !result.data) {
    redirect('/auth/signin');
  }

  const user = result.data;
  let userProjects: Awaited<ReturnType<typeof getUserProjects>> = [];
  let featuredProjects: Awaited<ReturnType<typeof getFeaturedProjects>> = [];
  let stats: Awaited<ReturnType<typeof getProjectStats>> = {
    totalStudents: 0,
    totalProjects: 0,
    totalSkills: 0,
    featuredProjects: 0,
    activeStudents: 0,
    newThisMonth: 0,
  };

  try {
    [userProjects, featuredProjects, stats] = await Promise.all([
      getUserProjects(user.id),
      getFeaturedProjects(3),
      getProjectStats(),
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Fallback data already set above
  }

  return (
    <PageErrorBoundary pageName="Dashboard">
      <PageContainer>
        <div className="flex items-center justify-between">
          <PageHeader
            title={`Welcome back, ${user.name}!`}
            description="Manage your projects and explore the community showcase"
          />
          <Link href="/projects/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <Section>
          <Grid cols="4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Projects</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProjects.length}</div>
                <p className="text-xs text-muted-foreground">
                  {userProjects.filter(p => p.isPublic).length} public
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community Projects</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.featuredProjects} featured
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
                  Building projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  New projects
                </p>
              </CardContent>
            </Card>
          </Grid>
        </Section>

        {/* My Projects */}
        <Section>
          <SectionErrorBoundary sectionName="my projects">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">My Projects</h2>
                <p className="text-muted-foreground">Your latest project work</p>
              </div>
              <Link href="/projects/my">
                <Button variant="outline">View All</Button>
              </Link>
            </div>

            {userProjects.length > 0 ? (
              <Grid cols="3">
                {userProjects.slice(0, 3).map((project) => (
                  <ProjectCard key={project.id} project={project} showEditActions={true} />
                ))}
              </Grid>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <Code className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Start building your portfolio by creating your first project
                  </p>
                  <Link href="/projects/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </SectionErrorBoundary>
        </Section>

        {/* Featured Community Projects */}
        {featuredProjects.length > 0 && (
          <Section>
            <SectionErrorBoundary sectionName="featured projects">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Featured Projects</h2>
                  <p className="text-muted-foreground">Discover amazing work from the community</p>
                </div>
                <Link href="/showcase">
                  <Button variant="outline">View Showcase</Button>
                </Link>
              </div>

              <Grid cols="3">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </Grid>
            </SectionErrorBoundary>
          </Section>
        )}

        {/* Quick Actions */}
        <Section>
          <SectionErrorBoundary sectionName="quick actions">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-6">
                    <Link href="/projects/create">
                      <Plus className="h-8 w-8" />
                      <div className="text-center">
                        <div className="font-medium">Create Project</div>
                        <div className="text-xs text-muted-foreground">Start a new project</div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-6">
                    <Link href="/projects">
                      <Trophy className="h-8 w-8" />
                      <div className="text-center">
                        <div className="font-medium">Browse Projects</div>
                        <div className="text-xs text-muted-foreground">Explore community work</div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-6">
                    <Link href="/community">
                      <Users className="h-8 w-8" />
                      <div className="text-center">
                        <div className="font-medium">Connect</div>
                        <div className="text-xs text-muted-foreground">Network with community</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </SectionErrorBoundary>
        </Section>
      </PageContainer>
    </PageErrorBoundary>
  );
} 