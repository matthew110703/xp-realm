import ky from "ky";
import { ADZUNA_API } from "@/constants/api.constants";
import { MAX_API_RESULTS_PER_SOURCE } from "@/constants/app.constants";
import type { APIJob } from "@/types/job.types";

interface AdzunaJob {
  id: string;
  redirect_url: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  contract_type: string | null;
  category: { label: string };
  created: string;
}

interface AdzunaResponse {
  results: AdzunaJob[];
}

export async function fetchAdzunaJobs(
  keywords: string[] = [],
  country = "gb",
): Promise<APIJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const what = [...keywords].slice(0, 3).join(" ") || "remote";

  const data = await ky
    .get(`${ADZUNA_API}/${country}/search/1`, {
      searchParams: {
        app_id: appId,
        app_key: appKey,
        results_per_page: MAX_API_RESULTS_PER_SOURCE,
        what,
        where: "remote",
        content_type: "application/json",
      },
      timeout: 10000,
    })
    .json<AdzunaResponse>();

  return data.results.map((job) => {
    const salary =
      job.salary_min && job.salary_max
        ? `£${job.salary_min.toLocaleString()}–£${job.salary_max.toLocaleString()}`
        : null;

    return {
      id: `adzuna-${job.id}`,
      title: job.title,
      company: job.company.display_name,
      companyLogo: null,
      url: job.redirect_url,
      jobType: job.contract_type || null,
      location: job.location.display_name,
      salary,
      description: job.description,
      tags: [job.category.label],
      category: job.category.label,
      postedAt: job.created,
      source: "api" as const,
      provider: "adzuna" as const,
      relevanceScore: 0,
    };
  });
}
