import { callClaude } from "@/lib/claude";
import type { ScrapedJob } from "@/types/job.types";

interface ExtractedJobItem {
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

export async function extractJobsFromHtmlWithClaude(
  html: string,
  siteName: string,
  siteUrl: string,
): Promise<ScrapedJob[]> {
  const prompt = `Extract all job postings from the following HTML/text. Return a JSON array where each item has: title, company, description, jobType, skills (string[]), salary, location, applyUrl, confidenceScore (0-1). Return only valid JSON array, no markdown, no explanation.

Site: ${siteName} (${siteUrl})
HTML:
${html.slice(0, 8000)}`;

  const response = await callClaude(prompt, 2048);

  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  let extracted: ExtractedJobItem[];
  try {
    extracted = JSON.parse(jsonMatch[0]) as ExtractedJobItem[];
  } catch {
    return [];
  }

  const slug = siteName.replace(/\s+/g, "-").toLowerCase();
  const now = Date.now();

  return extracted
    .filter((d) => d.title && d.confidenceScore >= 0.3)
    .map((data, i): ScrapedJob => ({
      id: `scrape-${slug}-${now}-${i}`,
      title: data.title,
      company: data.company || null,
      url: data.applyUrl || siteUrl,
      jobType: data.jobType || null,
      location: data.location || "Remote",
      salary: data.salary || null,
      description: data.description || null,
      tags: data.skills || [],
      postedAt: null,
      source: "scrape",
      siteName,
      confidenceScore: Math.min(1, Math.max(0, data.confidenceScore)),
      rawUrl: siteUrl,
      skills: data.skills || [],
      extractionMethod: "claude",
    }));
}
