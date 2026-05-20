import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  country: z.string().optional(),
  city: z.string().optional(),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  payRangeMin: z.number().min(0).optional(),
  payRangeMax: z.number().min(0).optional(),
  currency: z.string().default("USD"),
  jobTypes: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  parsedSkills: z.array(z.string()).default([]),
});

export type ProfileInput = z.infer<typeof profileSchema>;
