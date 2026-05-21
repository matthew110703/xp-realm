import * as cheerio from "cheerio";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TELEGRAM_JOB_CHANNELS } from "@/constants/app.constants";
import { extractJobFromTelegramPost } from "./telegram-extractor";

interface TelegramRawPost {
  channelName: string;
  messageId: string;
  text: string;
  url: string;
  postedAt: Date | null;
}

export async function scrapeTelegramChannels(): Promise<TelegramRawPost[]> {
  const results: TelegramRawPost[] = [];

  for (const channel of TELEGRAM_JOB_CHANNELS) {
    try {
      const res = await fetch(`https://t.me/s/${channel}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; XPRealm/1.0)",
          "Accept": "text/html",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.log(`[telegram] ${channel} returned ${res.status} — skipping`);
        await delay(1200);
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);
      let scraped = 0;

      $("div.tgme_widget_message").each((_, el) => {
        const text = $(el).find(".tgme_widget_message_text").text().trim();
        if (text.length < 50) return;

        const link = $(el).find("a.tgme_widget_message_date").attr("href") ?? "";
        const datetimeAttr = $(el).find("time.time").attr("datetime") ?? null;
        const messageId = link.split("/").pop()?.replace(/\D/g, "") ?? "";

        if (!messageId) return;

        results.push({
          channelName: channel,
          messageId,
          text,
          url: link || `https://t.me/${channel}/${messageId}`,
          postedAt: datetimeAttr ? new Date(datetimeAttr) : null,
        });
        scraped++;
      });

      console.log(`[telegram] Scraped ${scraped} messages from ${channel}`);
    } catch (err) {
      console.error(`[telegram] Failed to scrape ${channel}:`, err);
    }

    await delay(1200);
  }

  return results;
}

export async function fetchAndCacheTelegramPosts(): Promise<number> {
  const rawPosts = await scrapeTelegramChannels();
  let newCount = 0;

  for (const post of rawPosts) {
    try {
      const result = await prisma.telegramPost.upsert({
        where: { channel_messageId: { channel: post.channelName, messageId: post.messageId } },
        create: {
          messageId: post.messageId,
          channel: post.channelName,
          rawText: post.text,
          url: post.url,
          postedAt: post.postedAt,
        },
        update: {},
      });
      if (result.fetchedAt >= new Date(Date.now() - 5000)) newCount++;
    } catch (err) {
      console.error(`[telegram] Upsert failed for ${post.channelName}/${post.messageId}:`, err);
    }
  }

  // Extract jobs for posts without extractedJob
  const unprocessed = await prisma.telegramPost.findMany({
    where: { extractedJob: { equals: Prisma.DbNull } },
    take: 30,
  });

  for (const post of unprocessed) {
    try {
      const extracted = await extractJobFromTelegramPost({
        messageId: post.messageId,
        rawText: post.rawText,
        channelName: post.channel,
      });
      await prisma.telegramPost.update({
        where: { channel_messageId: { channel: post.channel, messageId: post.messageId } },
        data: { extractedJob: extracted !== null ? (extracted as Prisma.InputJsonValue) : Prisma.JsonNull },
      });
    } catch (err) {
      console.error(`[telegram] Extraction failed for ${post.channel}/${post.messageId}:`, err);
    }
  }

  return newCount;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
