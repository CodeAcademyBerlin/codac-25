import { BookOpen, Clock, ChevronRight, FileText, Folder, GraduationCap, Users } from "lucide-react";
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDocsHierarchy } from '@/data/docs/docs-hierarchy';
import { getCourses } from '@/data/lms/courses';
import { getTrackProgress } from '@/data/tracks';

interface TreeNode {
  id: string;
  title: string;
  type: 'FOLDER' | 'DOCUMENT';
  parentId?: string;
  children?: TreeNode[];
  isExpanded?: boolean;
}

function findTrackContent(nodes: TreeNode[], trackName: string): TreeNode | null {
  for (const node of nodes) {
    if (node.title.toLowerCase().includes(trackName.toLowerCase()) ||
      (trackName === 'career' && node.title.toLowerCase().includes('career'))) {
      return node;
    }
    if (node.children) {
      const found = findTrackContent(node.children, trackName);
      if (found) return found;
    }
  }
  return null;
}

function renderContentTree(nodes: TreeNode[], level = 0): React.ReactNode {
  return nodes.map((node) => (
    <div key={node.id} className={`ml-${level * 4}`}>
      <Link href={`/docs/${node.id}`}>
        <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md transition-colors">
          {node.type === 'FOLDER' ? (
            <Folder className="h-4 w-4 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-sm font-medium">{node.title}</span>
          <ChevronRight className="h-3 w-3 ml-auto" />
        </div>
      </Link>
      {node.children && node.children.length > 0 && (
        <div className="ml-4 mt-1">
          {renderContentTree(node.children, level + 1)}
        </div>
      )}
    </div>
  ));
}

// Map track slugs to course categories
const trackCategoryMap = {
  'web': 'WEB_DEVELOPMENT',
  'data': 'DATA_SCIENCE',
  'career': 'CAREER_DEVELOPMENT'
};

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;

  // Validate track
  if (!['web', 'data', 'career'].includes(track)) {
    notFound();
  }

  const trackInfo = await getTrackProgress(track);

  if (!trackInfo) {
    notFound();
  }

  // Get courses for this track
  const allCourses = await getCourses();
  const trackCourses = allCourses.filter(course =>
    course.category === trackCategoryMap[track as keyof typeof trackCategoryMap]
  );

  // Get document hierarchy
  const hierarchy = await getDocsHierarchy('COURSE_MATERIAL');
  const trackContent = findTrackContent(hierarchy, track);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/learning" className="hover:text-foreground">Learning</Link>
          <ChevronRight className="h-4 w-4" />
          <span>{trackInfo.title}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{trackInfo.title}</h1>
        <p className="text-muted-foreground">{trackInfo.description}</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your advancement through the curriculum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{trackInfo.progress}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{trackInfo.completedLessons}/{trackInfo.totalLessons}</div>
              <div className="text-sm text-muted-foreground">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{trackInfo.estimatedTime}</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{trackInfo.progress}%</span>
            </div>
            <Progress value={trackInfo.progress} className="h-3" />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>Current: {trackInfo.currentLesson}</span>
          </div>
        </CardContent>
      </Card>

      {/* Courses and Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Available Courses */}
          {trackCourses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Structured Courses
                </CardTitle>
                <CardDescription>
                  Enroll in courses to get guided learning with projects and assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {trackCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge variant="outline" className="text-xs">
                            {course.category.replace('_', ' ')}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {course._count.enrollments} enrolled
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {course._count.projects} projects
                          </div>
                          <Link href={`/lms/courses/${course.id}`}>
                            <Button size="sm">
                              {course.enrollments && course.enrollments.length > 0 ? 'Continue' : 'Enroll'}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Materials
              </CardTitle>
              <CardDescription>
                Additional resources, documentation, and reference materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trackContent && trackContent.children ? (
                <div className="space-y-2">
                  {renderContentTree(trackContent.children)}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No additional materials available for this track yet.</p>
                  <Link
                    href="/docs?type=COURSE_MATERIAL"
                    className="text-primary hover:underline mt-2 inline-block"
                  >
                    Browse all course materials
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trackCourses.length > 0 ? (
                <Link href={`/lms/courses/${trackCourses[0].id}`}>
                  <Button className="w-full">
                    {trackCourses[0].enrollments && trackCourses[0].enrollments.length > 0 ? 'Continue Course' : 'Start First Course'}
                  </Button>
                </Link>
              ) : (
                <Link href="/lms">
                  <Button className="w-full">
                    Browse All Courses
                  </Button>
                </Link>
              )}
              <Link href="/community">
                <Button variant="outline" className="w-full">
                  Join Community
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Track Info */}
          <Card>
            <CardHeader>
              <CardTitle>Track Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1">
                <p className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Community
                </p>
                <p className="text-muted-foreground">Connect with fellow learners</p>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Estimated Time
                </p>
                <p className="text-muted-foreground">{trackInfo.estimatedTime} to complete</p>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Certification
                </p>
                <p className="text-muted-foreground">Earn certificates upon completion</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 