import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const source = req.nextUrl.searchParams.get("source");

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: session.user.id,
      ...(source ? { source } : {}),
    },
    orderBy: { savedAt: "desc" },
  });

  return Response.json({ bookmarks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const body = await req.json();
  const { source, externalId, title, company, url, jobType, location, salary, description, tags, postedAt } = body;

  if (!url || !title || !source) {
    return apiError("url, title, and source are required", "VALIDATION_ERROR");
  }

  const bookmark = await prisma.bookmark.upsert({
    where: { userId_url: { userId: session.user.id, url } },
    create: {
      userId: session.user.id,
      source,
      externalId,
      title,
      company,
      url,
      jobType,
      location,
      salary,
      description,
      tags: tags ?? [],
      postedAt: postedAt ? new Date(postedAt) : null,
    },
    update: {},
  });

  return Response.json({ bookmark }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const { ids } = await req.json() as { ids?: string[] };
  if (!ids?.length) return apiError("ids required", "VALIDATION_ERROR");

  await prisma.bookmark.deleteMany({
    where: { id: { in: ids }, userId: session.user.id },
  });

  return Response.json({ success: true });
}
