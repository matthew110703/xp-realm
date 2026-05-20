import { callClaude } from "@/lib/claude";
import type { ParsedExperience } from "@/types/profile.types";

interface CommentOptions {
  postTitle: string;
  postBody: string | null;
  userName: string;
  skills: string[];
  experience: ParsedExperience[];
  portfolioUrl: string | null;
}

export async function generateRedditComment(options: CommentOptions): Promise<string> {
  const { postTitle, postBody, userName, skills, experience, portfolioUrl } = options;

  const expSummary = experience
    .slice(0, 2)
    .map((e) => `${e.title} at ${e.company} (${e.duration})`)
    .join(", ");

  const prompt = `You are ${userName}. Write a natural, genuine Reddit comment expressing interest in this job post. Be specific to the post, not generic. Under 150 words. Sound human, conversational, not like AI.

Reddit post: "${postTitle}"
${postBody ? `Post body: ${postBody.slice(0, 400)}` : ""}

Your profile:
- Skills: ${skills.slice(0, 8).join(", ")}
- Experience: ${expSummary || "Not specified"}
${portfolioUrl ? `- Portfolio: ${portfolioUrl}` : ""}

Write ONLY the comment text, no quotes, no prefix.`;

  return await callClaude(prompt, 300);
}
