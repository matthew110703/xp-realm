import * as cheerio from "cheerio";
import pLimit from "p-limit";
import { SCRAPE_TARGETS, type ScrapeTarget } from "@/constants/scrape-targets.constants";
import { SCRAPE_CONFIG } from "@/constants/app.constants";

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; XPRealm/1.0)",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

const BEST_EFFORT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.google.com/",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Dest": "document",
};

async function fetchBestEffort(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: BEST_EFFORT_HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

let requestCount = 0;
let windowStart = Date.now();

function checkRateLimit() {
  const now = Date.now();
  if (now - windowStart > SCRAPE_CONFIG.windowMs) {
    requestCount = 0;
    windowStart = now;
  }
  if (requestCount >= SCRAPE_CONFIG.maxRequestsPerWindow) {
    throw new Error("Rate limit exceeded");
  }
  requestCount++;
}

async function fetchWithRetry(url: string): Promise<string> {
  let delay = SCRAPE_CONFIG.retryDelayMs;
  let lastError: Error = new Error("Unknown fetch error");

  for (let attempt = 0; attempt <= SCRAPE_CONFIG.maxRetries; attempt++) {
    try {
      checkRateLimit();
      const res = await fetch(url, {
        headers: FETCH_HEADERS,
        signal: AbortSignal.timeout(SCRAPE_CONFIG.timeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      lastError = err as Error;
      if (attempt < SCRAPE_CONFIG.maxRetries) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }
  throw lastError;
}

export interface ScrapedJobRaw {
  title: string;
  company: string;
  location: string;
  url: string;
}

export interface ScrapeResult {
  target: ScrapeTarget;
  jobs: ScrapedJobRaw[];
  rawHtml: string;
}

function extractFromPage($: cheerio.CheerioAPI, target: ScrapeTarget): ScrapedJobRaw[] {
  const jobs: ScrapedJobRaw[] = [];
  const { selectors } = target;

  $(selectors.container).each((_, el) => {
    const $el = $(el);
    const title = $el.find(selectors.title).first().text().trim();
    const company = $el.find(selectors.company).first().text().trim();
    const location = $el.find(selectors.location).first().text().trim();
    const href = $el.find(selectors.link).first().attr("href") ?? "";
    const url = href.startsWith("http") ? href : `${selectors.linkPrefix}${href}`;

    if (title && url && url !== selectors.linkPrefix) {
      jobs.push({ title, company, location, url });
    }
  });

  return jobs;
}

export async function scrapeAllTargets(): Promise<ScrapeResult[]> {
  console.log(
    `[scraper] Config: timeout=${SCRAPE_CONFIG.timeoutMs}ms concurrent=${SCRAPE_CONFIG.maxConcurrent} retries=${SCRAPE_CONFIG.maxRetries}`
  );

  const limit = pLimit(SCRAPE_CONFIG.maxConcurrent);

  const settled = await Promise.allSettled(
    SCRAPE_TARGETS.map((target) =>
      limit(async (): Promise<ScrapeResult> => {
        try {
          console.log(`[scraper] Starting: ${target.name}`);

          if (target.bestEffort) {
            const html = await fetchBestEffort(target.url);
            if (!html) {
              console.log(`[scraper] ${target.name} unavailable — skipping`);
              return { target, jobs: [], rawHtml: "" };
            }
            const $ = cheerio.load(html);
            const jobs = extractFromPage($, target);
            if (jobs.length === 0) {
              console.log(`[scraper] ${target.name} returned 0 results (likely blocked) — skipping`);
              return { target, jobs: [], rawHtml: "" };
            }
            console.log(`[scraper] Extracted ${jobs.length} jobs from ${target.name}`);
            return { target, jobs, rawHtml: "" };
          }

          const html = await fetchWithRetry(target.url);
          console.log(`[scraper] Fetched ${html.length} bytes from ${target.name}`);

          const $ = cheerio.load(html);
          const containers = $(target.selectors.container);
          console.log(`[scraper] Found ${containers.length} raw containers in ${target.name}`);

          const jobs = extractFromPage($, target);
          console.log(`[scraper] Extracted ${jobs.length} jobs from ${target.name}`);

          return { target, jobs, rawHtml: html.slice(0, 20000) };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[scraper] Error on ${target.name}: ${msg}`);
          return { target, jobs: [], rawHtml: "" };
        }
      })
    )
  );

  return settled
    .filter((r): r is PromiseFulfilledResult<ScrapeResult> => r.status === "fulfilled")
    .map((r) => r.value);
}
