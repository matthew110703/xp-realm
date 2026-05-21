import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";
import { sendTelegramMessage } from "@/services/telegram/telegram-bot";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const body = await req.json() as { chatId?: string };
  if (!body.chatId || typeof body.chatId !== "string") {
    return apiError("chatId is required", "VALIDATION_ERROR", 400);
  }

  const chatId = body.chatId.trim();

  const sent = await sendTelegramMessage(chatId, "✅ XPRealm connected! You'll receive job draft messages here.");
  if (!sent) {
    return apiError("Could not send test message — verify your chat ID is correct", "TELEGRAM_ERROR", 400);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { telegramChatId: chatId },
  });

  return Response.json({ success: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { telegramChatId: null },
  });

  return Response.json({ success: true });
}
