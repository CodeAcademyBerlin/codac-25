import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building,
  IndianRupee,
  Link as LinkIcon,
  Mail,
  MapPin,
} from "lucide-react";

import { getJobById } from "@/actions/job/get-jobs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface JobDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const job = await getJobById(params.id);

  if (!job) {
    notFound();
  }

  const postedDate = formatDistanceToNow(new Date(job.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/career/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-md">
                <Building className="h-5 w-5" />
                <span>{job.company}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p>{job.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <span className="capitalize">
                  {job.type.replace("_", "-").toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{job.location}</span>
              </div>
              {job.salary && (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-muted-foreground">
                    €
                  </span>
                  <span>{job.salary}</span>
                </div>
              )}
              {job.remote && (
                <Badge variant="secondary" className="text-sm">
                  Remote
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Apply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.applyUrl && (
                <Button asChild className="w-full">
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Apply Now
                  </a>
                </Button>
              )}
              {job.applyEmail && (
                <Button variant="outline" asChild className="w-full">
                  <a href={`mailto:${job.applyEmail}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email to Apply
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About the Poster</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {job.postedBy && (
                <>
                  <Avatar>
                    <AvatarImage src={job.postedBy.image ?? undefined} />
                    <AvatarFallback>
                      {job.postedBy.name?.charAt(0) ?? "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {job.postedBy.name ?? "Community"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Posted {postedDate}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
