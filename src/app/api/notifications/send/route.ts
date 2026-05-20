import { NextRequest } from "next/server";
import { apiError } from "@/lib/utils";
import { sendPushToAll } from "@/services/notifications/push.service";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return apiError("Unauthorized", "UNAUTHORIZED", 401);
  }

  const { title, body, url } = await req.json() as { title: string; body: string; url?: string };

  await sendPushToAll({
    title,
    body,
    icon: "/icons/icon-192.png",
    url: url ?? "/social",
  });

  return Response.json({ success: true });
}
