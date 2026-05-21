export interface HNPost {
  id: string;
  hnId: string;
  source: string;
  author: string | null;
  rawText: string;
  url: string | null;
  extractedJob: Record<string, unknown> | null;
  fetchedAt: string;
  threadMonth: string;
}
