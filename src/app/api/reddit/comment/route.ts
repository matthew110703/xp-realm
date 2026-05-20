import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserRedditClient } from "@/lib/reddit-client";
import { apiError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const { postId, comment } = await req.json() as { postId: string; comment: string };
  if (!postId || !comment) return apiError("postId and comment required", "VALIDATION_ERROR");

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "reddit" },
  });

  if (!account?.accessToken) {
    return apiError("Reddit account not connected", "REDDIT_NOT_CONNECTED", 403);
  }

  const now = Math.floor(Date.now() / 1000);
  if (account.expiresAt && account.expiresAt < now) {
    return apiError("Reddit token expired — please reconnect your account", "TOKEN_EXPIRED", 401);
  }

  const reddit = getUserRedditClient(account.accessToken);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submission = reddit.getSubmission(postId) as any;
  await submission.reply(comment);

  return Response.json({ success: true });
}
