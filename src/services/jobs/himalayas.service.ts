import ky from "ky";
import { HIMALAYAS_API } from "@/constants/api.constants";
import { MAX_API_RESULTS_PER_SOURCE } from "@/constants/app.constants";
import type { APIJob } from "@/types/job.types";

interface HimalayasCompany {
  name: string;
  logo?: string | null;
}

interface HimalayasLocation {
  name: string;
}

interface HimalayasJob {
  slug: string;
  title: string;
  company: HimalayasCompany;
  locations: HimalayasLocation[];
  employment: string | null;
  applyUrl: string;
  description: string | null;
  tags: string[];
  publishedAt: string | null;
}

interface HimalayasResponse {
  jobs: HimalayasJob[];
}

export async function fetchHimalayasJobs(
  skills: string[] = [],
  categories: string[] = [],
): Promise<APIJob[]> {
  const q = [...skills, ...categories].slice(0, 3).join(" ");
  const limit = Math.min(20, MAX_API_RESULTS_PER_SOURCE);

  const data = await ky
    .get(HIMALAYAS_API, {
      searchParams: {
        limit,
        ...(q ? { q } : {}),
      },
      timeout: 10000,
    })
    .json<HimalayasResponse>();

  return (data.jobs ?? []).map((job) => ({
    id: `himalayas-${job.slug}`,
    title: job.title,
    company: job.company.name,
    companyLogo: job.company.logo ?? null,
    url: job.applyUrl,
    jobType: normalizeJobType(job.employment),
    location: job.locations[0]?.name ?? "Remote",
    salary: null,
    description: job.description ?? null,
    tags: job.tags ?? [],
    category: null,
    postedAt: job.publishedAt ?? null,
    source: "api" as const,
    provider: "himalayas" as const,
    relevanceScore: 0,
  }));
}

function normalizeJobType(type: string | null): string | null {
  if (!type) return null;
  const lower = type.toLowerCase();
  if (lower.includes("part")) return "part-time";
  if (lower.includes("freelance") || lower.includes("contract")) return "freelance";
  if (lower.includes("full")) return "full-time";
  if (lower.includes("intern")) return "internship";
  return type;
}
