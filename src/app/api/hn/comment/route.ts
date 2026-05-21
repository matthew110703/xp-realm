import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";
import { postHNComment } from "@/services/hn/hn-commenter";
import { decrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const body = await req.json() as { parentId?: string; text?: string };
  if (!body.parentId || !body.text) {
    return apiError("parentId and text are required", "VALIDATION_ERROR", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hnSessionCookie: true },
  });

  if (!user?.hnSessionCookie) {
    return apiError("HN account not connected — add credentials in Settings", "NOT_CONNECTED", 403);
  }

  let sessionCookie: string;
  try {
    sessionCookie = decrypt(user.hnSessionCookie);
  } catch {
    return apiError("Failed to decrypt HN session — please reconnect your account", "DECRYPT_ERROR", 500);
  }

  const result = await postHNComment(body.parentId, body.text, sessionCookie);

  if (result === "expired") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hnSessionCookie: null },
    });
    return apiError("HN session expired — please reconnect your account in Settings", "SESSION_EXPIRED", 401);
  }

  if (result === "failed") {
    return apiError("Failed to post comment — please try again", "COMMENT_FAILED", 500);
  }

  return Response.json({ success: true });
}
