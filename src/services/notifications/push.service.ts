import { prisma } from "@/lib/prisma";
import { webpush, buildPushPayload, type PushPayload } from "@/lib/web-push";

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        buildPushPayload(payload),
      ).catch(() => {})
    )
  );
}

export async function sendPushToAll(payload: PushPayload): Promise<void> {
  const subs = await prisma.pushSubscription.findMany();

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        buildPushPayload(payload),
      ).catch(() => {})
    )
  );
}
