export const APP_NAME = "XPRealm";
export const APP_DESCRIPTION = "Your personal remote job exploration realm";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export const REDDIT_FETCH_CRON = "0 9 * * *";
export const COUNTRY_INFO_CACHE_DAYS = 7;
export const MAX_SCRAPED_RESULTS = 20;
export const MAX_API_RESULTS_PER_SOURCE = 30;

export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

export const TELEGRAM_JOB_CHANNELS = [
  "remotejobs",
  "jobsForDevs",
  "freelance_jobs_remote",
  "devjobs",
  "remoteindian",
  "techjobs_remote",
  "hirejunior",
] as const;

export type TelegramChannel = (typeof TELEGRAM_JOB_CHANNELS)[number];

export const TELEGRAM_BOT_API = "https://api.telegram.org/bot";
export const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "";

export const SCRAPE_CONFIG = {
  timeoutMs: Number(process.env.SCRAPE_TIMEOUT_MS) || 15000,
  maxConcurrent: Number(process.env.SCRAPE_MAX_CONCURRENT) || 3,
  maxRetries: 2,
  retryDelayMs: 1000,
  maxRequestsPerWindow: 10,
  windowMs: 60000,
} as const;
