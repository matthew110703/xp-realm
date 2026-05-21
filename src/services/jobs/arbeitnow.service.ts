import ky from "ky";
import { ARBEITNOW_API } from "@/constants/api.constants";
import type { APIJob } from "@/types/job.types";

interface ArbeitnowJob {
  slug: string;
  title: string;
  company_name: string;
  location: string;
  remote: boolean;
  job_types: string[];
  tags: string[];
  description: string | null;
  url: string;
  created_at: number;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
}

export async function fetchArbeitnowJobs(): Promise<APIJob[]> {
  const data = await ky
    .get(ARBEITNOW_API, {
      searchParams: { page: 1 },
      timeout: 10000,
    })
    .json<ArbeitnowResponse>();

  return (data.data ?? []).map((job) => ({
    id: `arbeitnow-${job.slug}`,
    title: job.title,
    company: job.company_name,
    companyLogo: null,
    url: job.url,
    jobType: job.job_types[0] ?? null,
    location: job.remote && !job.location ? "Remote" : job.location || "Remote",
    salary: null,
    description: job.description ?? null,
    tags: job.tags ?? [],
    category: job.tags[0] ?? null,
    postedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : null,
    source: "api" as const,
    provider: "arbeitnow" as const,
    relevanceScore: 0,
  }));
}
