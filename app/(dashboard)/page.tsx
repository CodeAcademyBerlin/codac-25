import { BookOpen, Clock, Users } from "lucide-react";
import Link from 'next/link';
import { redirect } from "next/navigation";

import { PageErrorBoundary, SectionErrorBoundary } from "@/components/error";
import { Grid, PageContainer, PageHeader, Section } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getEnrolledCourses } from '@/data/lms/courses';
import { getAllTracks } from '@/data/tracks';
import { getUser } from "@/data/user/get-user";
import { auth } from "@/lib/auth/auth";
import { getCurrentUser } from '@/lib/auth/auth-utils';



export const dynamic = 'force-dynamic';

export default async function LearningPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const result = await getUser(session.user.id);

  if (!result.success || !result.data) {
    redirect('/auth/signin');
  }

  const user = result.data;
  let tracks: Awaited<ReturnType<typeof getAllTracks>> = [];
  let enrolledCourses: Awaited<ReturnType<typeof getEnrolledCourses>> = [];

  try {
    tracks = await getAllTracks();
    enrolledCourses = user ? await getEnrolledCourses() : [];
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Fallback data
    tracks = [];
    enrolledCourses = [];
  }

  // Group enrolled courses by track
  const coursesByTrack = enrolledCourses.reduce((acc, course) => {
    const track = course.category.toLowerCase().replace('_development', '').replace('_science', '').replace('_services', '');
    if (!acc[track]) acc[track] = [];
    acc[track].push(course);
    return acc;
  }, {} as Record<string, typeof enrolledCourses>);

  return (
    <PageErrorBoundary pageName="Learning Dashboard">
      <PageContainer>
        <PageHeader
          title="My Learning"
          description="Track your progress across different learning tracks and access structured courses."
        />

        <Section>
          <SectionErrorBoundary sectionName="learning tracks">
            <Grid cols="3">
              {tracks.map((track) => {
                if (!track) return null;

                const trackSlug = track.title.toLowerCase().includes('web') ? 'web' :
                  track.title.toLowerCase().includes('data') ? 'data' : 'career';

                const enrolledInTrack = coursesByTrack[trackSlug] || [];

                return (
                  <Card key={trackSlug} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {track.title}
                        </CardTitle>
                        <Badge variant={track.isEnrolled ? 'default' : 'secondary'}>
                          {track.isEnrolled ? 'Enrolled' : 'Available'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {enrolledInTrack.length} course{enrolledInTrack.length !== 1 ? 's' : ''} enrolled
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{track.progress}%</span>
                        </div>
                        <Progress value={track.progress} className="h-2" />
                      </div>

                      {/* Current Module */}
                      {track.currentLesson && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>Current: {track.currentLesson}</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button asChild className="w-full">
                          <Link href={`/learning/${trackSlug}`}>
                            {track.isEnrolled ? 'Continue Learning' : 'Start Track'}
                          </Link>
                        </Button>
                        {enrolledInTrack.length > 0 && (
                          <Button variant="outline" asChild className="w-full">
                            <Link href="/lms">
                              View in LMS
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </Grid>
          </SectionErrorBoundary>
        </Section>

        <Section>
          <SectionErrorBoundary sectionName="recent activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest learning sessions and completed materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.category.replace('_', ' ')} • {course._count.projects} project{course._count.projects !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Link
                        href={`/lms/courses/${course.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Continue
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Welcome to Your Learning Journey!</p>
                      <p className="text-sm text-muted-foreground">Choose a track above to get started</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </SectionErrorBoundary>
        </Section>
      </PageContainer>
    </PageErrorBoundary>
  );
} 