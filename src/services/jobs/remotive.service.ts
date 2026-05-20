import ky from "ky";
import { REMOTIVE_API } from "@/constants/api.constants";
import { MAX_API_RESULTS_PER_SOURCE } from "@/constants/app.constants";
import type { APIJob } from "@/types/job.types";

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string | null;
  job_type: string | null;
  candidate_required_location: string | null;
  salary: string | null;
  description: string;
  tags: string[];
  category: string;
  publication_date: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

export async function fetchRemotiveJobs(
  skills: string[] = [],
  categories: string[] = [],
): Promise<APIJob[]> {
  const searchParam = [...skills, ...categories].slice(0, 3).join(" ");

  const data = await ky
    .get(REMOTIVE_API, {
      searchParams: {
        limit: MAX_API_RESULTS_PER_SOURCE,
        ...(searchParam ? { search: searchParam } : {}),
      },
      timeout: 10000,
    })
    .json<RemotiveResponse>();

  return data.jobs.map((job) => ({
    id: `remotive-${job.id}`,
    title: job.title,
    company: job.company_name,
    companyLogo: job.company_logo,
    url: job.url,
    jobType: normalizeJobType(job.job_type),
    location: job.candidate_required_location || "Remote",
    salary: job.salary || null,
    description: job.description,
    tags: job.tags || [],
    category: job.category || null,
    postedAt: job.publication_date,
    source: "api" as const,
    provider: "remotive" as const,
    relevanceScore: 0,
  }));
}

function normalizeJobType(type: string | null): string | null {
  if (!type) return null;
  const lower = type.toLowerCase();
  if (lower.includes("part")) return "part-time";
  if (lower.includes("freelance") || lower.includes("contract")) return "freelance";
  if (lower.includes("full")) return "full-time";
  return type;
}
