import webpush from "web-push";

function initVapid() {
  const email = process.env.VAPID_EMAIL;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (email && publicKey && privateKey) {
    webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
  }
}

initVapid();

export { webpush };

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export function buildPushPayload(payload: PushPayload): string {
  return JSON.stringify(payload);
}
