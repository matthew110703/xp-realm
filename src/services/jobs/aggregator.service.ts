import { fetchRemotiveJobs } from "./remotive.service";
import { fetchJobicyJobs } from "./jobicy.service";
import { fetchAdzunaJobs } from "./adzuna.service";
import type { APIJob } from "@/types/job.types";

interface AggregateOptions {
  skills?: string[];
  categories?: string[];
  jobTypes?: string[];
  keyword?: string;
}

function scoreRelevance(job: APIJob, skills: string[], categories: string[]): number {
  let score = 0;
  const searchTarget = `${job.title} ${job.tags.join(" ")} ${job.category ?? ""}`.toLowerCase();

  for (const skill of skills) {
    if (searchTarget.includes(skill.toLowerCase())) score += 2;
  }
  for (const cat of categories) {
    if (searchTarget.includes(cat.toLowerCase())) score += 1;
  }
  return score;
}

export async function aggregateJobs(options: AggregateOptions = {}): Promise<APIJob[]> {
  const { skills = [], categories = [], jobTypes = [], keyword } = options;
  const searchTerms = keyword ? [keyword, ...skills] : skills;

  const [remotive, jobicy, adzuna] = await Promise.allSettled([
    fetchRemotiveJobs(searchTerms, categories),
    fetchJobicyJobs(searchTerms),
    fetchAdzunaJobs(searchTerms),
  ]);

  const allJobs: APIJob[] = [
    ...(remotive.status === "fulfilled" ? remotive.value : []),
    ...(jobicy.status === "fulfilled" ? jobicy.value : []),
    ...(adzuna.status === "fulfilled" ? adzuna.value : []),
  ];

  const seenUrls = new Set<string>();
  const deduped = allJobs.filter((job) => {
    const key = job.url.replace(/[?#].*$/, "");
    if (seenUrls.has(key)) return false;
    seenUrls.add(key);
    return true;
  });

  const scored = deduped.map((job) => ({
    ...job,
    relevanceScore: scoreRelevance(job, skills, categories),
  }));

  if (jobTypes.length > 0) {
    const filtered = scored.filter(
      (j) => !j.jobType || typeof j.jobType !== "string" || jobTypes.some((t) => j.jobType!.toLowerCase().includes(t))
    );
    return filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
