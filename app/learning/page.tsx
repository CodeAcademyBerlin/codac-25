import { BookOpen, Clock, Trophy, Users } from "lucide-react";
import Link from 'next/link';


import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDocs } from '@/data/docs/docs';

// Mock data for course progress - this would come from the database in a real implementation
const courseProgress = {
  'web': { progress: 75, currentModule: 'Module-2', status: 'In Progress' },
  'data': { progress: 45, currentModule: 'Module-1', status: 'In Progress' },
  'career': { progress: 20, currentModule: 'Step-1', status: 'Not Started' }
};

export default async function LearningPage() {
  // Get all course material documents
  const docs = await getDocs('COURSE_MATERIAL');

  // Group docs by course track
  const coursesByTrack = docs.reduce((acc, doc) => {
    const track = doc.title.toLowerCase().includes('web') ? 'web' :
      doc.title.toLowerCase().includes('data') ? 'data' :
        doc.title.toLowerCase().includes('career') ? 'career' : 'other';

    if (!acc[track]) acc[track] = [];
    acc[track].push(doc);
    return acc;
  }, {} as Record<string, typeof docs>);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
        <p className="text-muted-foreground">
          Track your progress across different learning tracks and access all course materials.
        </p>
      </div>

      {/* Learning Tracks Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(coursesByTrack).map(([track, documents]) => {
          if (track === 'other') return null;

          const trackInfo = courseProgress[track as keyof typeof courseProgress];
          const trackTitle = {
            'web': 'Web Development',
            'data': 'Data Science',
            'career': 'Career Services'
          }[track] || track;

          return (
            <Card key={track} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {trackTitle}
                  </CardTitle>
                  <Badge variant={trackInfo?.status === 'In Progress' ? 'default' : 'secondary'}>
                    {trackInfo?.status || 'Available'}
                  </Badge>
                </div>
                <CardDescription>
                  {documents.length} learning materials available
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{trackInfo?.progress || 0}%</span>
                  </div>
                  <Progress value={trackInfo?.progress || 0} className="h-2" />
                </div>

                {/* Current Module */}
                {trackInfo?.currentModule && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Current: {trackInfo.currentModule}</span>
                  </div>
                )}

                {/* Action Button */}
                <Link
                  href={`/learning/${track}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 w-full"
                >
                  {trackInfo?.status === 'In Progress' ? 'Continue Learning' : 'Start Track'}
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Learning Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest learning sessions and completed materials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mock recent activity - would come from database */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex-shrink-0">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Completed: JavaScript Fundamentals</p>
              <p className="text-sm text-muted-foreground">Web Development • 2 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Started: React Development</p>
              <p className="text-sm text-muted-foreground">Web Development • 1 day ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Joined: Data Analysis Study Group</p>
              <p className="text-sm text-muted-foreground">Community • 3 days ago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access to All Content */}
      <Card>
        <CardHeader>
          <CardTitle>All Learning Materials</CardTitle>
          <CardDescription>
            Browse all available course content and resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/docs?type=COURSE_MATERIAL"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Browse All Course Materials
          </Link>
        </CardContent>
      </Card>
    </div>
  );
} 