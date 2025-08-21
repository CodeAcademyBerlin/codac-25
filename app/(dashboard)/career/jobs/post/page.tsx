import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { JobPostingForm } from "@/components/career/job-posting-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";

export default async function PostJobPage() {
  const session = await auth();
  const user = session?.user;

  if (!user || (user.role !== "ADMIN" && user.role !== "MENTOR")) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground mt-2">
          You do not have permission to post a job. Please contact an
          administrator if you believe this is a mistake.
        </p>
        <Button asChild className="mt-4">
          <Link href="/career/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/career/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>

        <h1 className="text-3xl font-bold">Post a Job</h1>
        <p className="text-muted-foreground mt-2">
          Share career opportunities with our community
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Job Posting Form</CardTitle>
            <CardDescription>
              Fill out the details below to post your job opportunity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobPostingForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
