export interface TelegramPost {
  id: string;
  messageId: string;
  channel: string;
  rawText: string;
  url: string | null;
  extractedJob: Record<string, unknown> | null;
  fetchedAt: string;
  postedAt: string | null;
}
