import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const channel = req.nextUrl.searchParams.get("channel");
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));
  const limit = 20;

  const posts = await prisma.telegramPost.findMany({
    where: {
      ...(channel ? { channel } : {}),
    },
    orderBy: [{ postedAt: "desc" }, { fetchedAt: "desc" }],
    skip: (page - 1) * limit,
    take: limit,
  });

  return Response.json({ posts });
}
