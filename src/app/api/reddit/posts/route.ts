import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const subreddit = req.nextUrl.searchParams.get("subreddit");
  const flair = req.nextUrl.searchParams.get("flair");

  const posts = await prisma.redditPost.findMany({
    where: {
      ...(subreddit ? { subreddit } : {}),
      ...(flair ? { flair } : {}),
    },
    orderBy: { fetchedAt: "desc" },
    take: 50,
  });

  return Response.json({ posts });
}
