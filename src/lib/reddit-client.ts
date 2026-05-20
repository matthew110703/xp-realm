import Snoowrap from "snoowrap";

let appClient: Snoowrap | null = null;

export function getRedditAppClient(): Snoowrap {
  if (appClient) return appClient;

  appClient = new Snoowrap({
    userAgent: "XPRealm/1.0 (personal job finder)",
    clientId: process.env.REDDIT_APP_CLIENT_ID!,
    clientSecret: process.env.REDDIT_APP_CLIENT_SECRET!,
    username: undefined,
    password: undefined,
    accessToken: undefined,
    refreshToken: undefined,
  });

  return appClient;
}

export function getUserRedditClient(accessToken: string): Snoowrap {
  return new Snoowrap({
    userAgent: "XPRealm/1.0 (personal job finder)",
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    accessToken,
  });
}
