import * as z from "zod";

export const jobSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    company: z.string().min(2, "Company name must be at least 2 characters"),
    location: z.string().optional(),
    type: z.enum([
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "INTERNSHIP",
      "FREELANCE",
    ]),
    level: z.enum(["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD", "EXECUTIVE"]),
    salary: z.string().optional(),
    remote: z.boolean().default(false),
    applyUrl: z
      .string()
      .url("Please enter a valid URL")
      .optional()
      .or(z.literal("")),
    applyEmail: z
      .string()
      .email("Please enter a valid email")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.applyUrl || data.applyEmail, {
    message: "Either an application URL or email is required",
    path: ["applyUrl"],
  });
