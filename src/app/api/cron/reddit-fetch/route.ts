import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAndCacheRedditPosts } from "@/services/reddit/reddit-fetcher";
import { webpush, buildPushPayload } from "@/lib/web-push";
import { APP_NAME } from "@/constants/app.constants";

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newCount = await fetchAndCacheRedditPosts();

  if (newCount > 0) {
    const subscriptions = await prisma.pushSubscription.findMany();

    const payload = buildPushPayload({
      title: `${APP_NAME} — New Opportunities`,
      body: `${newCount} new remote job posts found on Reddit`,
      icon: "/icons/icon-192.png",
      url: "/social",
    });

    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        ).catch(() => {})
      )
    );
  }

  return Response.json({ success: true, newPosts: newCount });
}
