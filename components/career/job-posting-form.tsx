"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createJob } from "@/actions/job/create-job";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { jobSchema } from "@/lib/validation/job";


type JobFormValues = z.infer<typeof jobSchema>;

export function JobPostingForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<JobFormValues>({
    defaultValues: {
      title: "",
      description: "",
      company: "",
      location: "",
      type: "FULL_TIME",
      level: "ENTRY",
      salary: "",
      remote: false,
      applyUrl: "",
      applyEmail: "",
    },
  });

  const onSubmit = (values: JobFormValues) => {
    startTransition(async () => {
      const result = await createJob(values);

      if (result.success) {
        toast.success("Success!", {
          description: "Your job has been posted.",
        });
        router.refresh();
        router.push("/career/jobs");
        return;
      }

      const { error } = result;
      for (const key in error) {
        if (key !== "_errors" && key !== "form") {
          const field = key as keyof JobFormValues;
          const message = error[field]?._errors[0];
          if (message) {
            form.setError(field, { type: "manual", message });
          }
        }
      }

      if (error.form) {
        toast.error("Error", { description: error.form });
      } else {
        toast.error("Error", {
          description: "Please fix the errors in the form and try again.",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 'Software Engineer'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 'Coda Inc.'" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 'Berlin, Germany'" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full-time</SelectItem>
                    <SelectItem value="PART_TIME">Part-time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    <SelectItem value="FREELANCE">Freelance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ENTRY">Entry-level</SelectItem>
                    <SelectItem value="JUNIOR">Junior</SelectItem>
                    <SelectItem value="MID">Mid-level</SelectItem>
                    <SelectItem value="SENIOR">Senior-level</SelectItem>
                    <SelectItem value="LEAD">Lead</SelectItem>
                    <SelectItem value="EXECUTIVE">Executive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Range (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. '€50,000 - €70,000'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remote"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Remote work allowed</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="applyUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://your-company.com/apply"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A direct link to the application page.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="applyEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Email</FormLabel>
                <FormControl>
                  <Input placeholder="recruiting@your-company.com" {...field} />
                </FormControl>
                <FormDescription>
                  An email address for applications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/career/jobs">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Job
          </Button>
        </div>
      </form>
    </Form>
  );
}
