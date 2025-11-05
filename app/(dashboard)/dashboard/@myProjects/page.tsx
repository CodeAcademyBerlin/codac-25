import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function MyProjectsSlot() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Projects</CardTitle>
        <CardDescription>Recent projects you're working on</CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-muted-foreground'>
          Projects section coming soon
        </p>
      </CardContent>
    </Card>
  );
}

