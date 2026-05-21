import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";
import { authenticateHN } from "@/services/hn/hn-commenter";
import { encrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const body = await req.json() as { username?: string; password?: string };
  if (!body.username || !body.password) {
    return apiError("username and password are required", "VALIDATION_ERROR", 400);
  }

  const rawCookie = await authenticateHN(body.username, body.password);
  if (!rawCookie) {
    return apiError("Invalid HN credentials — check your username and password", "AUTH_FAILED", 401);
  }

  const encryptedCookie = encrypt(rawCookie);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { hnSessionCookie: encryptedCookie },
  });

  return Response.json({ success: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { hnSessionCookie: null },
  });

  return Response.json({ success: true });
}
