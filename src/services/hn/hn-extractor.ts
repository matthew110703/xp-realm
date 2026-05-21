import { callClaude } from "@/lib/claude";

interface HNPostInput {
  hnId: string;
  rawText: string;
  source: string;
}

interface ExtractedHNJob {
  title?: string;
  company?: string;
  location?: string;
  jobType?: string;
  skills?: string[];
  salary?: string;
  remote?: boolean;
  applyUrl?: string;
  confidenceScore?: number;
}

export async function extractJobFromHNPost(
  post: HNPostInput
): Promise<Record<string, unknown> | null> {
  if (post.rawText.length < 100) return null;

  const prompt = `Extract job posting details from this Hacker News comment.
Return JSON with: title, company, location, remote (bool), jobType (part-time/freelance/contract/full-time/internship), skills (string[]), salary, applyUrl, description, confidenceScore (0-1).
If this is not a job post return the exact string: null

Comment:
${post.rawText.slice(0, 2000)}`;

  try {
    const response = await callClaude(prompt, 512);
    const trimmed = response.trim();
    if (trimmed === "null") return null;

    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]) as ExtractedHNJob;
    if ((parsed.confidenceScore ?? 0) < 0.3) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}
