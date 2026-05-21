import { TELEGRAM_BOT_API } from "@/constants/app.constants";

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("[telegram-bot] TELEGRAM_BOT_TOKEN is not set");
    return false;
  }

  try {
    const res = await fetch(`${TELEGRAM_BOT_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch (err) {
    console.error("[telegram-bot] sendMessage failed:", err);
    return false;
  }
}
