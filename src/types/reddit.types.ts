export interface RedditPost {
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
  extractedJob: Record<string, unknown> | null;
  fetchedAt: string;
  userId: string | null;
}

export interface RedditAccount {
  connected: boolean;
  username: string | null;
  accessToken: string | null;
}
