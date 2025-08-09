import { BookOpen, Clock, Users } from "lucide-react";
import Link from 'next/link';

import { Grid, PageContainer, PageHeader, Section } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getEnrolledCourses } from '@/data/lms/courses';
import { getAllTracks } from '@/data/tracks';
import { getCurrentUser } from '@/lib/auth/auth-utils';



export const dynamic = 'force-dynamic';

export default async function LearningPage() {
  let user;
  let tracks: Awaited<ReturnType<typeof getAllTracks>> = [];
  let enrolledCourses: Awaited<ReturnType<typeof getEnrolledCourses>> = [];

  try {
    user = await getCurrentUser();
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
    <PageContainer>
      <PageHeader 
        title="My Learning"
        description="Track your progress across different learning tracks and access structured courses."
      />

      <Section>
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
                  <Link
                    href={`/learning/${trackSlug}`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 w-full"
                  >
                    {track.isEnrolled ? 'Continue Learning' : 'Start Track'}
                  </Link>
                  {enrolledInTrack.length > 0 && (
                    <Link
                      href="/lms"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full"
                    >
                      View in LMS
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        </Grid>
      </Section>

      <Section>
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
      </Section>
    </PageContainer>
  );
} 