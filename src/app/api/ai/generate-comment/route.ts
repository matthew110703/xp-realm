import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";
import { generateRedditComment } from "@/services/reddit/comment-generator";
import type { ParsedExperience } from "@/types/profile.types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const { postTitle, postBody, postId } = await req.json() as {
    postTitle: string;
    postBody: string | null;
    postId: string;
  };

  if (!postTitle || !postId) return apiError("postTitle and postId required", "VALIDATION_ERROR");

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, portfolioUrl: true },
    }),
    prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { parsedSkills: true, parsedExp: true },
    }),
  ]);

  const comment = await generateRedditComment({
    postTitle,
    postBody,
    userName: user?.name ?? "User",
    skills: profile?.parsedSkills ?? [],
    experience: (profile?.parsedExp as unknown as ParsedExperience[] | null) ?? [],
    portfolioUrl: user?.portfolioUrl ?? null,
  });

  return Response.json({ comment });
}
