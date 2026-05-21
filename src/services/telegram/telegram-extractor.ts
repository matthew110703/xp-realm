import { callClaude } from "@/lib/claude";

interface TelegramPostInput {
  messageId: string;
  rawText: string;
  channelName: string;
}

export async function extractJobFromTelegramPost(
  post: TelegramPostInput
): Promise<Record<string, unknown> | null> {
  if (post.rawText.length < 50) return null;

  const prompt = `Extract job posting from this Telegram message.
Return JSON: title, company, location, remote (bool), jobType (part-time/freelance/contract/full-time/internship), skills (string[]), salary, applyUrl, description, confidenceScore (0-1).
Return the exact string null if this is not a job post.

Message:
${post.rawText.slice(0, 1500)}`;

  try {
    const response = await callClaude(prompt, 512);
    const trimmed = response.trim();
    if (trimmed === "null") return null;

    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]) as { confidenceScore?: number };
    if ((parsed.confidenceScore ?? 0) < 0.3) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}
