import { z } from "zod";

export const jobFilterSchema = z.object({
  keyword: z.string().optional(),
  jobType: z.string().optional(),
  category: z.string().optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  datePosted: z.enum(["24h", "week", "month", "any"]).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(30),
});

export type JobFilterInput = z.infer<typeof jobFilterSchema>;
