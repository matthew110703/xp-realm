import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";
import { callClaude } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const body = await req.json() as { postText?: string; hnId?: string };
  if (!body.postText) {
    return apiError("postText is required", "VALIDATION_ERROR", 400);
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { parsedSkills: true, bio: true },
  });

  const skills = userProfile?.parsedSkills ?? [];

  const prompt = `You are a job seeker writing a comment on a Hacker News "Who is Hiring?" thread.

Job post:
${body.postText.slice(0, 1000)}

${skills.length > 0 ? `Your skills: ${skills.join(", ")}` : ""}
${userProfile?.bio ? `Your background: ${userProfile.bio}` : ""}

Write a genuine, specific HN-style comment expressing interest (under 150 words). Be direct and mention your relevant experience. Sound like a real person, not a cover letter. Do not start with "I am" or "My name is".`;

  const comment = await callClaude(prompt, 768);

  return Response.json({ comment });
}
