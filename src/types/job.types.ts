export type JobSource = "api" | "scrape" | "reddit";

export interface BaseJob {
  id: string;
  title: string;
  company: string | null;
  url: string;
  jobType: string | null;
  location: string | null;
  salary: string | null;
  description: string | null;
  tags: string[];
  postedAt: string | null;
  source: JobSource;
}

export interface APIJob extends BaseJob {
  source: "api";
  provider: "remotive" | "jobicy" | "adzuna" | "himalayas" | "arbeitnow";
  companyLogo: string | null;
  category: string | null;
  relevanceScore: number;
}

export interface ScrapedJob extends BaseJob {
  source: "scrape";
  siteName: string;
  confidenceScore: number;
  rawUrl: string;
  skills: string[];
  extractionMethod: "cheerio" | "claude";
}

export interface RedditJobPost {
  id: string;
  redditId: string;
  subreddit: string;
  title: string;
  body: string | null;
  author: string;
  url: string;
  permalink: string;
  flair: string | null;
  score: number;
  commentCount: number;
  extractedJob: ExtractedJobInfo | null;
  fetchedAt: string;
}

export interface ExtractedJobInfo {
  title?: string;
  jobType?: string;
  skills?: string[];
  salary?: string;
  location?: string;
  confidenceScore?: number;
}

export interface SavedBookmark {
  id: string;
  source: JobSource;
  externalId: string | null;
  title: string;
  company: string | null;
  url: string;
  jobType: string | null;
  location: string | null;
  salary: string | null;
  description: string | null;
  tags: string[];
  postedAt: string | null;
  savedAt: string;
}

export interface JobFilters {
  keyword?: string;
  jobType?: string;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  datePosted?: "24h" | "week" | "month" | "any";
}
