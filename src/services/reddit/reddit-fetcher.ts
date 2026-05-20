import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRedditAppClient } from "@/lib/reddit-client";
import { callClaude } from "@/lib/claude";
import { REDDIT_JOB_SUBREDDITS } from "@/constants/jobs.constants";

interface RedditSubmission {
  id: string;
  title: string;
  selftext: string;
  author: { name: string };
  url: string;
  permalink: string;
  link_flair_text: string | null;
  score: number;
  num_comments: number;
  created_utc: number;
}

export async function fetchAndCacheRedditPosts(): Promise<number> {
  const reddit = getRedditAppClient();
  const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
  let newCount = 0;

  for (const subreddit of REDDIT_JOB_SUBREDDITS) {
    try {
      const posts = await (reddit.getSubreddit(subreddit) as { getNew: (opts: object) => Promise<RedditSubmission[]> })
        .getNew({ limit: 25 }) as unknown as RedditSubmission[];

      const recentPosts = posts.filter((p) => p.created_utc > oneDayAgo);

      for (const post of recentPosts) {
        await prisma.redditPost.upsert({
          where: { redditId: post.id },
          create: {
            redditId: post.id,
            subreddit,
            title: post.title,
            body: post.selftext?.slice(0, 2000) || null,
            author: post.author?.name ?? "[deleted]",
            url: post.url,
            permalink: `https://reddit.com${post.permalink}`,
            flair: post.link_flair_text,
            score: post.score,
            commentCount: post.num_comments,
          },
          update: {
            score: post.score,
            commentCount: post.num_comments,
          },
        });
        newCount++;
      }
    } catch {
      // skip this subreddit on error
    }
  }

  await extractJobsForNewPosts();
  return newCount;
}

async function extractJobsForNewPosts() {
  const unprocessed = await prisma.redditPost.findMany({
    where: { extractedJob: { equals: Prisma.DbNull } },
    take: 20,
  });

  for (const post of unprocessed) {
    try {
      const prompt = `From this Reddit job post, extract structured info as JSON with keys:
- title: string (job title if specified)
- jobType: string (part-time/freelance/contract/full-time)
- skills: string[] (skills/technologies mentioned)
- salary: string (pay rate if mentioned)
- location: string (location or "Remote")
- confidenceScore: number (0-1, is this actually a job offer/request?)

Post: "${post.title}" ${post.body ? `\n${post.body.slice(0, 500)}` : ""}

Return ONLY valid JSON.`;

      const response = await callClaude(prompt, 512);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        await prisma.redditPost.update({
          where: { id: post.id },
          data: { extractedJob: extracted },
        });
      }
    } catch {
      // skip on error
    }
  }
}
