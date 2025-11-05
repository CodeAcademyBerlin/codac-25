import { getJobs } from "@/actions/job/get-jobs";
import { getSession } from '@/lib/auth/session';

import { JobCardClient } from "./job-card-client";

type Job = Awaited<ReturnType<typeof getJobs>>[number];

interface JobCardProps {
  job: Job;
}

export async function JobCard({ job }: JobCardProps) {
  const session = await getSession();
  // Cast to any to avoid type mismatch - Better Auth session structure differs
  return <JobCardClient job={job} session={session as any} />;
}
