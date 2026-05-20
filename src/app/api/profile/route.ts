import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";
import { profileSchema } from "@/validations/profile.schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user) return apiError("User not found", "NOT_FOUND", 404);

  return Response.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, "VALIDATION_ERROR");
  }

  const { name, country, city, portfolioUrl, bio, payRangeMin, payRangeMax, currency, jobTypes, categories, parsedSkills } = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, country, city, portfolioUrl: portfolioUrl || null, payRangeMin, payRangeMax, currency },
  });

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, bio, jobTypes, categories, parsedSkills },
    update: { bio, jobTypes, categories, parsedSkills },
  });

  return Response.json({ success: true });
}
