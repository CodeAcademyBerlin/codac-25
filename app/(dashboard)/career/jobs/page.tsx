import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { getJobs } from "@/actions/job/get-jobs";
import { JobCard } from "@/components/career/job-card";
import { JobFilters } from "@/components/career/job-filters";
import { PageContainer, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireServerAuth } from "@/lib/auth/auth-server";



interface JobsPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    level?: string;
    remote?: string;
    company?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const user = await requireServerAuth();

  const canPostJob = user.role === "ADMIN" || user.role === "MENTOR";

  return (
    <PageContainer size="xl">
      <PageHeader
        title="Job Board"
        description="Discover career opportunities from our community and partners"
      />
        {canPostJob && (
          <Button asChild>
            <Link href="/career/jobs/post">
              <Plus className="h-4 w-4 mr-2" />
              Post a Job
            </Link>
          </Button>
        )}
      </PageHeader>

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
    </PageContainer>
  );
}

type JobsListProps = {
  searchParams: JobsPageProps["searchParams"];
};

async function JobsList({ searchParams }: JobsListProps) {
  const params = await searchParams;
  const jobs = await getJobs(params);

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
      {jobs.map((item) => (
        <JobCard key={`job-${item.id}`} job={item} />
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
