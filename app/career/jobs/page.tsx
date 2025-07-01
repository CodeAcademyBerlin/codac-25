import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { getJobs } from '@/actions/job/get-jobs'
import { JobCard } from '@/components/career/job-card'
import { JobFilters } from '@/components/career/job-filters'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface JobsPageProps {
  searchParams: Promise<{
    search?: string
    type?: string
    level?: string
    remote?: string
    company?: string
  }>
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job Board</h1>
          <p className="text-muted-foreground mt-2">
            Discover career opportunities from our community and partners
          </p>
        </div>
        <Button asChild>
          <Link href="/career/jobs/post">
            <Plus className="h-4 w-4 mr-2" />
            Post a Job
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <JobFilters />
        </div>

        {/* Jobs List */}
        <div className="lg:col-span-3">
          <Suspense fallback={<JobsLoading />}>
            <JobsList searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function JobsList({ searchParams }: {
  searchParams: {
    search?: string
    type?: string
    level?: string
    remote?: string
    company?: string
  }
}) {
  const jobs = await getJobs(searchParams)

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or check back later for new opportunities.
        </p>
      </div>
    )
  }

  // Transform the jobs data to match JobCard expectations
  const transformedJobs = jobs.map(job => ({
    id: job.id,
    title: job.title,
    description: job.description,
    company: job.company,
    location: job.location,
    type: job.type,
    level: job.level,
    salary: job.salary,
    remote: job.remote,
    skills: Array.isArray(job.skills) ? job.skills as string[] : null,
    benefits: Array.isArray(job.benefits) ? job.benefits as string[] : null,
    featured: job.featured,
    createdAt: job.createdAt,
    postedBy: job.postedBy,
    _count: job._count,
  }))

  return (
    <div className="space-y-6">
      {transformedJobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}

function JobsLoading() {
  return (
    <div className="space-y-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border rounded-lg p-6">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-20 w-full mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
} 