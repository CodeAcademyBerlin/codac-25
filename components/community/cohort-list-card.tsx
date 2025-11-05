import { Calendar, Users } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CohortListCardProps {
  cohort: {
    id: string;
    name: string;
    slug: string;
    startDate: Date;
    endDate: Date | null;
    image?: string | null;
    students?: any[];
    _count?: {
      students: number;
    };
  };
}

export function CohortListCard({ cohort }: CohortListCardProps) {
  const studentCount = cohort._count?.students || cohort.students?.length || 0;

  return (
    <Link href={`/community/${cohort.slug}`}>
      <Card className='h-full transition-all hover:shadow-lg cursor-pointer'>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div>
              <CardTitle>{cohort.name}</CardTitle>
              <CardDescription>
                <div className='flex items-center gap-2 mt-2'>
                  <Calendar className='h-4 w-4' />
                  <span>
                    {cohort.startDate.toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                    {cohort.endDate &&
                      ` - ${cohort.endDate.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}`}
                  </span>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Badge variant='secondary' className='flex items-center gap-1 w-fit'>
            <Users className='h-3 w-3' />
            {studentCount} students
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

