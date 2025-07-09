import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { getJobById } from "@/actions/job/get-jobs";
import { auth } from "@/lib/auth/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JobEditForm } from "@/components/career/job-edit-form";

interface EditJobPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/auth/signin");
  }

  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  const canEdit = user.role === "ADMIN" || user.role === "MENTOR";

  if (!canEdit) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground mt-2">
          You do not have permission to edit this job.
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

        <h1 className="text-3xl font-bold">Edit Job</h1>
        <p className="text-muted-foreground mt-2">
          Update the details of your job opportunity
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Job Edit Form</CardTitle>
            <CardDescription>
              Modify the fields below to update the job post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobEditForm job={job} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
