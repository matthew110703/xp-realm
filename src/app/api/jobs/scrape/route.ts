import { auth } from "@/lib/auth";
import { apiError } from "@/lib/utils";
import { scrapeStaticPage } from "@/services/scraper/cheerio-scraper";
import { scrapeDynamicPage } from "@/services/scraper/playwright-scraper";
import { extractJobFromText } from "@/services/scraper/job-extractor";
import { SCRAPE_TARGETS } from "@/constants/scrape-targets.constants";
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

  const results: ScrapedJob[] = [];

  const scrapeResults = await Promise.allSettled(
    SCRAPE_TARGETS.map(async (target) => {
      const rawText = target.type === "dynamic"
        ? await scrapeDynamicPage(target.url)
        : await scrapeStaticPage(target.url);

      const job = await extractJobFromText(rawText, target.name, target.url);
      return job;
    })
  );

  for (const result of scrapeResults) {
    if (result.status === "fulfilled" && result.value) {
      results.push(result.value);
    }
  }

  return Response.json({
    jobs: results.slice(0, MAX_SCRAPED_RESULTS),
    total: results.length,
  });
}
