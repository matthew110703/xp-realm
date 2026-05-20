import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";
import { aggregateJobs } from "@/services/jobs/aggregator.service";
import { jobFilterSchema } from "@/validations/job-filter.schema";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const params = Object.fromEntries(req.nextUrl.searchParams);
  const filters = jobFilterSchema.parse(params);

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { parsedSkills: true, categories: true, jobTypes: true },
  });

  const jobs = await aggregateJobs({
    skills: profile?.parsedSkills ?? [],
    categories: profile?.categories ?? [],
    jobTypes: filters.jobType ? [filters.jobType] : profile?.jobTypes ?? [],
    keyword: filters.keyword,
  });

  const start = (filters.page - 1) * filters.limit;
  const page = jobs.slice(start, start + filters.limit);

  return Response.json({ jobs: page, total: jobs.length });
}
