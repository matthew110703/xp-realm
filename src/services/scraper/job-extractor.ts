import { callClaude } from "@/lib/claude";
import type { ScrapedJob } from "@/types/job.types";

interface ExtractedJob {
  title: string;
  company: string;
  description: string;
  jobType: string;
  skills: string[];
  salary: string;
  location: string;
  applyUrl: string;
  confidenceScore: number;
}

export async function extractJobFromText(
  rawText: string,
  siteName: string,
  siteUrl: string,
): Promise<ScrapedJob | null> {
  const prompt = `Given the following scraped webpage text from "${siteName}", extract job posting information into JSON with these exact keys:
- title: string (job title, or null)
- company: string (company name, or null)
- description: string (job description summary, or null)
- jobType: string (part-time/freelance/contract/full-time, or null)
- skills: string[] (required skills/technologies)
- salary: string (salary info if present, or null)
- location: string (location or "Remote")
- applyUrl: string (apply URL if found, otherwise use the page URL: ${siteUrl})
- confidenceScore: number (0-1, how confident you are this is a real job posting with enough info)

Scraped text:
${rawText.slice(0, 6000)}

Return ONLY valid JSON or null if no job posting found.`;

  const response = await callClaude(prompt, 1024);

  if (response.trim().toLowerCase() === "null") return null;

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  const data = JSON.parse(jsonMatch[0]) as ExtractedJob;
  if (!data.title || data.confidenceScore < 0.3) return null;

  return {
    id: `scrape-${siteName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`,
    title: data.title,
    company: data.company || null,
    url: data.applyUrl || siteUrl,
    jobType: data.jobType || null,
    location: data.location || "Remote",
    salary: data.salary || null,
    description: data.description || null,
    tags: data.skills || [],
    postedAt: null,
    source: "scrape" as const,
    siteName,
    confidenceScore: Math.min(1, Math.max(0, data.confidenceScore)),
    rawUrl: siteUrl,
    skills: data.skills || [],
  };
}
