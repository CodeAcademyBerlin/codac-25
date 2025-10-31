import { getJobs } from "@/actions/job/get-jobs";
import { getSession } from '@/lib/auth/session';

import { JobCardClient } from "./job-card-client";

type Job = Awaited<ReturnType<typeof getJobs>>[number];

interface JobCardProps {
  job: Job;
}

export async function JobCard({ job }: JobCardProps) {
  const session = await getSession();
  return <JobCardClient job={job} session={session} />;
}
