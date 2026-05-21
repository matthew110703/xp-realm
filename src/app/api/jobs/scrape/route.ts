import { auth } from "@/lib/auth";
import { apiError } from "@/lib/utils";
import { scrapeAllTargets } from "@/services/scraper/cheerio-scraper";
import { extractJobsFromHtmlWithClaude } from "@/services/scraper/job-extractor";
import { MAX_SCRAPED_RESULTS } from "@/constants/app.constants";
import type { ScrapedJob } from "@/types/job.types";

const lastScrapeTime = new Map<string, number>();
const DEBOUNCE_MS = 30000;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const userId = session.user.id;
  const lastTime = lastScrapeTime.get(userId) ?? 0;
  if (Date.now() - lastTime < DEBOUNCE_MS) {
    return apiError("Please wait before scraping again", "RATE_LIMITED", 429);
  }
  lastScrapeTime.set(userId, Date.now());

  const siteResults = await scrapeAllTargets();
  const allJobs: ScrapedJob[] = [];

  for (const { target, jobs: cheerioJobs, rawHtml } of siteResults) {
    if (cheerioJobs.length > 0) {
      const slug = target.name.replace(/\s+/g, "-").toLowerCase();
      const now = Date.now();
      const mapped = cheerioJobs.map((j, i): ScrapedJob => ({
        id: `scrape-${slug}-${now}-${i}`,
        title: j.title,
        company: j.company || null,
        url: j.url,
        jobType: null,
        location: j.location || "Remote",
        salary: null,
        description: null,
        tags: [],
        postedAt: null,
        source: "scrape",
        siteName: target.name,
        confidenceScore: 0.7,
        rawUrl: target.url,
        skills: [],
        extractionMethod: "cheerio",
      }));
      allJobs.push(...mapped);
    } else if (rawHtml) {
      const claudeJobs = await extractJobsFromHtmlWithClaude(rawHtml, target.name, target.url);
      allJobs.push(...claudeJobs);
    }
  }

  return Response.json({
    jobs: allJobs.slice(0, MAX_SCRAPED_RESULTS),
    total: allJobs.length,
  });
}
