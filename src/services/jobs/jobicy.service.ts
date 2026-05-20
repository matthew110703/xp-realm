import ky from "ky";
import { JOBICY_API } from "@/constants/api.constants";
import { MAX_API_RESULTS_PER_SOURCE } from "@/constants/app.constants";
import type { APIJob } from "@/types/job.types";

interface JobicyJob {
  id: string;
  url: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string | null;
  jobType: string | null;
  jobGeo: string | null;
  jobSalaryMin: number | null;
  jobSalaryMax: number | null;
  jobSalaryCurrency: string | null;
  jobExcerpt: string | null;
  jobIndustry: string[] | null;
  pubDate: string;
}

interface JobicyResponse {
  jobs: JobicyJob[];
}

export async function fetchJobicyJobs(
  skills: string[] = [],
): Promise<APIJob[]> {
  const tag = skills.slice(0, 1)[0] || "";

  const data = await ky
    .get(JOBICY_API, {
      searchParams: {
        count: MAX_API_RESULTS_PER_SOURCE,
        ...(tag ? { tag } : {}),
      },
      timeout: 10000,
    })
    .json<JobicyResponse>();

  return data.jobs.map((job) => {
    const salary = job.jobSalaryMin && job.jobSalaryMax
      ? `${job.jobSalaryCurrency ?? "USD"} ${job.jobSalaryMin.toLocaleString()}–${job.jobSalaryMax.toLocaleString()}`
      : null;

    return {
      id: `jobicy-${job.id}`,
      title: job.jobTitle,
      company: job.companyName,
      companyLogo: job.companyLogo,
      url: job.url,
      jobType: job.jobType || null,
      location: job.jobGeo || "Remote",
      salary,
      description: job.jobExcerpt || null,
      tags: job.jobIndustry ?? [],
      category: job.jobIndustry?.[0] ?? null,
      postedAt: job.pubDate,
      source: "api" as const,
      provider: "jobicy" as const,
      relevanceScore: 0,
    };
  });
}
