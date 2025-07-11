"use client";

import {
  Building,
  MapPin,
  Briefcase,
  Trash2,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteJob } from "@/actions/job/delete-job";
import { getJobs } from "@/actions/job/get-jobs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";





type Job = Awaited<ReturnType<typeof getJobs>>[number];

interface JobCardClientProps {
  job: Job;
  session: Session | null;
}

export function JobCardClient({ job, session }: JobCardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const user = session?.user;

  const canModify = user && (user.role === "ADMIN" || user.role === "MENTOR");

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteJob(job.id);
      if (result.success) {
        toast.success("Job deleted successfully");
      } else {
        toast.error("Failed to delete job", {
          description: result.message,
        });
      }
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/career/jobs/${job.id}/edit`);
  };

  const handleCardClick = () => {
    router.push(`/career/jobs/${job.id}`);
  };

  return (
    <Card
      className="relative group hover:bg-muted/40 transition-colors cursor-pointer"
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${job.title}`}
    >
      {canModify && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={isPending}
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this job posting.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isPending}
                >
                  {isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4" />
            <span>{job.company}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {job.type.replace("_", "-").toLowerCase()}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </Badge>
          {job.salary && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span className="text-base font-semibold">€</span>
              {job.salary}
            </Badge>
          )}
          {job.remote && <Badge variant="secondary">Remote</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
