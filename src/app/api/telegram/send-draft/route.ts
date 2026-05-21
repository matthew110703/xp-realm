import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";
import { callClaude } from "@/lib/claude";
import { sendTelegramMessage } from "@/services/telegram/telegram-bot";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const body = await req.json() as {
    postSource?: string;
    postTitle?: string;
    postBody?: string;
  };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user?.telegramChatId) {
    return apiError("Telegram not connected — add your chat ID in Settings", "NOT_CONNECTED", 400);
  }

  const skills = user.profile?.parsedSkills ?? [];
  const prompt = `You are a job seeker drafting a message to express interest in a job opportunity.

Job posting: ${body.postTitle ?? "Unknown position"}
${body.postBody ? `Details: ${body.postBody.slice(0, 500)}` : ""}
${skills.length > 0 ? `Your skills: ${skills.join(", ")}` : ""}

Write a brief, genuine interest message (under 150 words). Be specific to the role. Include a note about your key skills. Do not use placeholders like [Your Name]. Write in first person.`;

  const draft = await callClaude(prompt, 768);

  const message = `📋 <b>Job Draft — ${body.postSource?.toUpperCase() ?? "Job"}</b>\n\n<b>${body.postTitle ?? ""}</b>\n\n${draft}`;

  const sent = await sendTelegramMessage(user.telegramChatId, message);
  if (!sent) {
    return apiError("Failed to send message to Telegram", "TELEGRAM_ERROR", 500);
  }

  return Response.json({ success: true, draft });
}
