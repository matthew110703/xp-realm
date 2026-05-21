import { XMLParser } from "fast-xml-parser";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { extractJobFromHNPost } from "./hn-extractor";

interface HNRawPost {
  hnId: string;
  author: string;
  text: string;
  url: string | null;
  createdAt: string;
  source: "algolia" | "rss_jobs" | "rss_freelance";
}

interface AlgoliaSearchResult {
  objectID: string;
  author: string;
  comment_text: string | null;
  url: string | null;
  created_at: string;
  hits?: AlgoliaSearchResult[];
  nbPages?: number;
}

interface AlgoliaHiringResult {
  hits: Array<{ objectID: string }>;
}

export async function fetchLatestHiringThread(): Promise<HNRawPost[]> {
  const searchRes = await fetch(
    "https://hn.algolia.com/api/v1/search?tags=ask_hn&query=who+is+hiring&hitsPerPage=1",
    { signal: AbortSignal.timeout(10000) }
  );
  const searchData = (await searchRes.json()) as AlgoliaHiringResult;
  const threadId = searchData.hits?.[0]?.objectID;
  if (!threadId) return [];

  const posts: HNRawPost[] = [];
  const now = new Date();
  const threadMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  for (let page = 0; page <= 10; page++) {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?tags=comment,story_${threadId}&hitsPerPage=100&page=${page}`,
      { signal: AbortSignal.timeout(10000) }
    );
    const data = (await res.json()) as { hits: AlgoliaSearchResult[]; nbPages: number };
    if (!data.hits || data.hits.length === 0) break;

    for (const hit of data.hits) {
      if (!hit.comment_text) continue;
      posts.push({
        hnId: hit.objectID,
        author: hit.author ?? "unknown",
        text: hit.comment_text,
        url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
        createdAt: hit.created_at ?? new Date().toISOString(),
        source: "algolia",
      });
    }

    if (page >= (data.nbPages ?? 0) - 1) break;
  }

  return posts;
}

export async function fetchFreelanceRSS(): Promise<HNRawPost[]> {
  const feeds: Array<{ url: string; source: "rss_jobs" | "rss_freelance" }> = [
    { url: "https://hnrss.org/whoishiring/jobs", source: "rss_jobs" },
    { url: "https://hnrss.org/whoishiring/freelance", source: "rss_freelance" },
  ];

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const posts: HNRawPost[] = [];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, { signal: AbortSignal.timeout(10000) });
      const xml = await res.text();
      const parsed = parser.parse(xml) as {
        rss?: { channel?: { item?: RSSItem | RSSItem[] } };
      };
      const items = parsed.rss?.channel?.item;
      if (!items) continue;
      const itemArray = Array.isArray(items) ? items : [items];

      for (const item of itemArray) {
        const link = typeof item.link === "string" ? item.link : "";
        const hnIdMatch = link.match(/item\?id=(\d+)/);
        const hnId = hnIdMatch?.[1] ?? `rss-${Date.now()}-${Math.random()}`;
        const text = typeof item.description === "string" ? item.description : "";

        posts.push({
          hnId,
          author: typeof item["dc:creator"] === "string" ? item["dc:creator"] : "unknown",
          text: text.replace(/<[^>]+>/g, ""),
          url: link || null,
          createdAt: typeof item.pubDate === "string" ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source: feed.source,
        });
      }
    } catch (err) {
      console.error(`[hn-fetcher] RSS feed ${feed.url} failed:`, err);
    }
  }

  return posts;
}

interface RSSItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  "dc:creator"?: string;
}

export async function fetchAndCacheHNPosts(): Promise<number> {
  const now = new Date();
  const threadMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [algolia, rss] = await Promise.allSettled([
    fetchLatestHiringThread(),
    fetchFreelanceRSS(),
  ]);

  const allPosts: HNRawPost[] = [
    ...(algolia.status === "fulfilled" ? algolia.value : []),
    ...(rss.status === "fulfilled" ? rss.value : []),
  ];

  let newCount = 0;

  for (const post of allPosts) {
    const existing = await prisma.hNPost.findUnique({ where: { hnId: post.hnId } });
    if (!existing) {
      await prisma.hNPost.create({
        data: {
          hnId: post.hnId,
          source: post.source,
          author: post.author,
          rawText: post.text,
          url: post.url,
          threadMonth,
        },
      });
      newCount++;
    }
  }

  // Extract jobs for posts without extractedJob
  const unprocessed = await prisma.hNPost.findMany({
    where: { extractedJob: { equals: Prisma.DbNull } },
    take: 50,
  });

  for (const post of unprocessed) {
    try {
      const extracted = await extractJobFromHNPost({
        hnId: post.hnId,
        rawText: post.rawText,
        source: post.source,
      });
      if (extracted !== null) {
        await prisma.hNPost.update({
          where: { hnId: post.hnId },
          data: { extractedJob: extracted as Prisma.InputJsonValue },
        });
      } else {
        // Mark as processed (empty object) so we don't retry
        await prisma.hNPost.update({
          where: { hnId: post.hnId },
          data: { extractedJob: Prisma.JsonNull },
        });
      }
    } catch (err) {
      console.error(`[hn-fetcher] Extraction failed for ${post.hnId}:`, err);
    }
  }

  return newCount;
}
