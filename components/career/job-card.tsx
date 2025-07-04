import { getJobs } from "@/actions/job/get-jobs";
import { auth } from "@/lib/auth/auth";

import { JobCardClient } from "./job-card-client";

type Job = Awaited<ReturnType<typeof getJobs>>[number];

interface JobCardProps {
  job: Job;
}

export async function JobCard({ job }: JobCardProps) {
  const session = await auth();
  return <JobCardClient job={job} session={session} />;
}
