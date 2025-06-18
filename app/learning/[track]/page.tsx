import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BookOpen, Clock, ChevronRight, FileText, Folder } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDocsHierarchy } from '@/data/docs-hierarchy';

interface TreeNode {
  id: string;
  title: string;
  type: 'FOLDER' | 'DOCUMENT';
  parentId?: string;
  children?: TreeNode[];
  isExpanded?: boolean;
}

// Mock progress data - this would come from the database
const mockProgress = {
  'web': {
    title: 'Web Development',
    description: 'Learn to build modern web applications with HTML, CSS, JavaScript, and React',
    progress: 75,
    currentLesson: 'React Components',
    totalLessons: 24,
    completedLessons: 18,
    estimatedTime: '12 weeks'
  },
  'data': {
    title: 'Data Science',
    description: 'Master data analysis, visualization, and machine learning with Python',
    progress: 45,
    currentLesson: 'Data Visualization with Tableau',
    totalLessons: 32,
    completedLessons: 14,
    estimatedTime: '16 weeks'
  },
  'career': {
    title: 'Career Services',
    description: 'Prepare for your job search with CV writing, interview skills, and networking',
    progress: 20,
    currentLesson: 'Goal Setting',
    totalLessons: 12,
    completedLessons: 2,
    estimatedTime: '6 weeks'
  }
};

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

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  
  // Validate track
  if (!['web', 'data', 'career'].includes(track)) {
    notFound();
  }

  const trackInfo = mockProgress[track as keyof typeof mockProgress];
  const hierarchy = await getDocsHierarchy('COURSE_MATERIAL');
  
  // Find the specific track content in the hierarchy
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

      {/* Course Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                Navigate through modules, projects, and lessons
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trackContent && trackContent.children ? (
                <div className="space-y-2">
                  {renderContentTree(trackContent.children)}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <p>No content available for this track yet.</p>
                  <Link 
                    href="/docs?type=COURSE_MATERIAL"
                    className="text-primary hover:underline"
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
              <Link
                href={trackContent ? `/docs/${trackContent.id}` : '/docs'}
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
              >
                Continue Learning
              </Link>
              <Link
                href="/community/discussions"
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                Join Discussion
              </Link>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <p className="font-medium">Study Materials</p>
                <p className="text-muted-foreground">Documentation, guides, and references</p>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium">Community</p>
                <p className="text-muted-foreground">Connect with fellow students</p>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium">Mentorship</p>
                <p className="text-muted-foreground">Get help from experienced developers</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 