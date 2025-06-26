import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { getJobs } from "@/actions/job/get-jobs";
import { JobCard } from "@/components/career/job-card";
import { JobFilters } from "@/components/career/job-filters";

type Job = Awaited<ReturnType<typeof getJobs>>[number];

interface JobsPageProps {
  searchParams: {
    search?: string;
    type?: string;
    level?: string;
    remote?: string;
    company?: string;
  };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
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
            <JobsList searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

type JobsListProps = {
  searchParams: JobsPageProps["searchParams"];
};

async function JobsList({ searchParams }: JobsListProps) {
  const jobs = await getJobs(searchParams);

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or check back later for new opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map((job: Job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
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
  );
}
