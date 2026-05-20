import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingDone: true },
  });

  return Response.json({ success: true });
}
