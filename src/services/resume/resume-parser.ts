import { callClaude } from "@/lib/claude";
import type { ParsedResume } from "@/types/profile.types";

export async function parsePDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
  const result = await pdfParse(buffer);
  return result.text;
}

export async function parseDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function structureResumeWithClaude(rawText: string): Promise<ParsedResume> {
  const prompt = `Given the following resume text, extract a structured JSON with these exact keys:
- skills: string[] (list of technical and soft skills)
- experience: Array of { title: string, company: string, duration: string, description: string }
- education: Array of { degree: string, institution: string, year: string }
- summary: string (2-3 sentence professional summary)

Resume text:
${rawText.slice(0, 8000)}

Return ONLY valid JSON, no markdown, no explanation.`;

  const response = await callClaude(prompt, 2048);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not extract JSON from Claude response");

  const parsed = JSON.parse(jsonMatch[0]) as ParsedResume;
  return {
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    summary: parsed.summary ?? "",
  };
}
