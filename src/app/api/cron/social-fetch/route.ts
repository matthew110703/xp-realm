import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAndCacheRedditPosts } from "@/services/reddit/reddit-fetcher";
import { fetchAndCacheHNPosts } from "@/services/hn/hn-fetcher";
import { fetchAndCacheTelegramPosts } from "@/services/telegram/telegram-scraper";
import { webpush, buildPushPayload } from "@/lib/web-push";
import { APP_NAME } from "@/constants/app.constants";

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [redditResult, hnResult, telegramResult] = await Promise.allSettled([
    fetchAndCacheRedditPosts(),
    fetchAndCacheHNPosts(),
    fetchAndCacheTelegramPosts(),
  ]);

  const redditCount = redditResult.status === "fulfilled" ? redditResult.value : 0;
  const hnCount = hnResult.status === "fulfilled" ? hnResult.value : 0;
  const telegramCount = telegramResult.status === "fulfilled" ? telegramResult.value : 0;
  const totalNew = redditCount + hnCount + telegramCount;

  if (totalNew > 0) {
    const subscriptions = await prisma.pushSubscription.findMany();

    const parts: string[] = [];
    if (redditCount > 0) parts.push(`${redditCount} Reddit`);
    if (hnCount > 0) parts.push(`${hnCount} HN`);
    if (telegramCount > 0) parts.push(`${telegramCount} Telegram`);

    const payload = buildPushPayload({
      title: `${APP_NAME} — New Opportunities`,
      body: `${parts.join(", ")} posts found`,
      icon: "/icons/icon-192.png",
      url: "/social",
    });

    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush
          .sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          )
          .catch(() => {})
      )
    );
  }

  return Response.json({
    success: true,
    newPosts: { reddit: redditCount, hn: hnCount, telegram: telegramCount },
  });
}
