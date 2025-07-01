import { formatDistanceToNow } from 'date-fns'
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Users,
  Star,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

interface JobCardProps {
  job: {
    id: string
    title: string
    description: string
    company: string
    location: string | null
    type: string
    level: string
    salary: string | null
    remote: boolean
    skills: string[] | null
    benefits: string[] | null
    featured: boolean
    createdAt: Date
    postedBy: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    } | null
    _count: {
      applications: number
    }
  }
}

export function JobCard({ job }: JobCardProps) {
  const skills = job.skills || []
  const benefits = job.benefits || []

  return (
    <Card className={`relative ${job.featured ? 'border-primary shadow-md' : ''}`}>
      {job.featured && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="default" className="bg-primary">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <Badge variant="outline">{job.type.replace('_', ' ')}</Badge>
              <Badge variant="secondary">{job.level}</Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {job.company}
              </div>

              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
              )}

              {job.remote && (
                <Badge variant="outline" className="text-xs">
                  Remote
                </Badge>
              )}

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(job.createdAt, { addSuffix: true })}
              </div>
            </div>

            {job.salary && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4" />
                {job.salary}
              </div>
            )}
          </div>

          {job.postedBy && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={job.postedBy.image || ''} />
                <AvatarFallback>
                  {job.postedBy.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{job.postedBy.name}</div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {job.description}
        </p>

        {skills.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Required Skills</div>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 5).map((skill: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{skills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {benefits.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Benefits</div>
            <div className="flex flex-wrap gap-1">
              {benefits.slice(0, 3).map((benefit: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {benefit}
                </Badge>
              ))}
              {benefits.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{benefits.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {job._count.applications} application{job._count.applications !== 1 ? 's' : ''}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/career/jobs/${job.id}`}>
              View Details
            </Link>
          </Button>

          <Button size="sm" asChild>
            <Link href={`/career/jobs/${job.id}/apply`}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Apply Now
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 