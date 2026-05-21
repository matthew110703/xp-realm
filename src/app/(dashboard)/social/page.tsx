"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RedditPostCard } from "@/components/jobs/reddit-post-card";
import { HNPostCard } from "@/components/social/hn-post-card";
import { TelegramPostCard } from "@/components/social/telegram-post-card";
import { CommentPreviewModal } from "@/components/reddit/comment-preview-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { JobCardSkeletonGrid } from "@/components/shared/loading-skeleton";
import { formatRelativeDate } from "@/lib/utils";
import { REDDIT_JOB_SUBREDDITS } from "@/constants/jobs.constants";
import { TELEGRAM_JOB_CHANNELS } from "@/constants/app.constants";
import type { RedditPost } from "@/types/reddit.types";
import type { HNPost } from "@/types/hn.types";
import type { TelegramPost } from "@/types/telegram.types";

interface RedditAccount {
  connected: boolean;
  username: string | null;
}

export default function SocialPage() {
  const [redditAccount, setRedditAccount] = useState<RedditAccount>({ connected: false, username: null });
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [hnConnected, setHnConnected] = useState(false);

  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [hnPosts, setHnPosts] = useState<HNPost[]>([]);
  const [telegramPosts, setTelegramPosts] = useState<TelegramPost[]>([]);

  const [loadingReddit, setLoadingReddit] = useState(true);
  const [loadingHN, setLoadingHN] = useState(true);
  const [loadingTelegram, setLoadingTelegram] = useState(true);

  const [subreddit, setSubreddit] = useState<string>("all");
  const [hnSource, setHnSource] = useState<string>("all");
  const [telegramChannel, setTelegramChannel] = useState<string>("all");

  const [lastUpdatedReddit, setLastUpdatedReddit] = useState<Date | null>(null);
  const [lastUpdatedHN, setLastUpdatedHN] = useState<Date | null>(null);
  const [lastUpdatedTelegram, setLastUpdatedTelegram] = useState<Date | null>(null);

  const [commentModal, setCommentModal] = useState<{
    open: boolean;
    post: RedditPost | null;
    comment: string;
    generating: boolean;
  }>({ open: false, post: null, comment: "", generating: false });

  useEffect(() => {
    checkProfile();
    fetchRedditPosts();
    fetchHNPosts();
    fetchTelegramPosts();
  }, []);

  useEffect(() => { fetchRedditPosts(); }, [subreddit]);
  useEffect(() => { fetchHNPosts(); }, [hnSource]);
  useEffect(() => { fetchTelegramPosts(); }, [telegramChannel]);

  async function checkProfile() {
    const res = await fetch("/api/profile");
    if (!res.ok) return;
    const data = await res.json() as {
      user: { accounts?: { provider: string }[]; telegramChatId?: string | null; hnConnected?: boolean };
    };
    const redditAcc = data.user?.accounts?.find((a) => a.provider === "reddit");
    setRedditAccount({ connected: !!redditAcc, username: null });
    setTelegramConnected(!!data.user?.telegramChatId);
    setHnConnected(!!data.user?.hnConnected);
  }

  async function fetchRedditPosts() {
    setLoadingReddit(true);
    const params = subreddit !== "all" ? `?subreddit=${subreddit}` : "";
    const res = await fetch(`/api/reddit/posts${params}`);
    const data = await res.json() as { posts: RedditPost[] };
    setPosts(data.posts ?? []);
    setLastUpdatedReddit(new Date());
    setLoadingReddit(false);
  }

  async function fetchHNPosts() {
    setLoadingHN(true);
    const params = hnSource !== "all" ? `?source=${hnSource}` : "";
    const res = await fetch(`/api/hn/posts${params}`);
    const data = await res.json() as { posts: HNPost[] };
    setHnPosts(data.posts ?? []);
    setLastUpdatedHN(new Date());
    setLoadingHN(false);
  }

  async function fetchTelegramPosts() {
    setLoadingTelegram(true);
    const params = telegramChannel !== "all" ? `?channel=${telegramChannel}` : "";
    const res = await fetch(`/api/telegram/posts${params}`);
    const data = await res.json() as { posts: TelegramPost[] };
    setTelegramPosts(data.posts ?? []);
    setLastUpdatedTelegram(new Date());
    setLoadingTelegram(false);
  }

  async function handleGenerateComment(post: RedditPost) {
    setCommentModal({ open: true, post, comment: "", generating: true });

    const res = await fetch("/api/ai/generate-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postTitle: post.title, postBody: post.body, postId: post.redditId }),
    });

    const data = await res.json() as { comment: string };
    setCommentModal((prev) => ({ ...prev, comment: data.comment ?? "", generating: false }));
  }

  async function handleSendToTelegram(post: HNPost | TelegramPost | RedditPost) {
    const isHN = "hnId" in post;
    const isTelegram = "messageId" in post;
    const postTitle = isHN
      ? (post as HNPost & { extractedJob?: { company?: string } }).extractedJob?.company ?? "HN Post"
      : isTelegram
      ? (post as TelegramPost & { extractedJob?: { title?: string } }).extractedJob?.title ?? "Telegram Post"
      : (post as RedditPost).title;
    const postBody = isHN
      ? (post as HNPost).rawText
      : isTelegram
      ? (post as TelegramPost).rawText
      : (post as RedditPost).body ?? "";

    await fetch("/api/telegram/send-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postSource: isHN ? "hn" : isTelegram ? "telegram" : "reddit",
        postTitle,
        postBody,
      }),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Social</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect and engage with the job community</p>
      </div>

      {/* Connected Accounts */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Connected accounts</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <span className="text-orange-400 text-sm font-bold">R</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Reddit</p>
                  {redditAccount.connected ? (
                    <p className="text-xs text-primary">Connected</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not connected</p>
                  )}
                </div>
              </div>
              {!redditAccount.connected && (
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => signIn("reddit")}>
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className={`border-border/50 ${!telegramConnected ? "opacity-60" : ""}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-sky-500/10 flex items-center justify-center">
                  <span className="text-sky-400 text-sm font-bold">T</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Telegram Bot</p>
                  {telegramConnected ? (
                    <p className="text-xs text-primary">Connected</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Connect in Settings</p>
                  )}
                </div>
              </div>
              {!telegramConnected && (
                <Badge variant="outline" className="text-xs">Settings</Badge>
              )}
            </CardContent>
          </Card>

          <Card className={`border-border/50 ${!hnConnected ? "opacity-60" : ""}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-600/10 flex items-center justify-center">
                  <span className="text-amber-500 text-sm font-bold">HN</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Hacker News</p>
                  {hnConnected ? (
                    <p className="text-xs text-primary">Connected</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Connect in Settings</p>
                  )}
                </div>
              </div>
              {!hnConnected && (
                <Badge variant="outline" className="text-xs">Settings</Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reddit posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Reddit job posts</h2>
            {lastUpdatedReddit && (
              <p className="text-xs text-muted-foreground mt-0.5">Last updated {formatRelativeDate(lastUpdatedReddit)}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={subreddit} onValueChange={(v) => v !== null && setSubreddit(v)}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subreddits</SelectItem>
                {REDDIT_JOB_SUBREDDITS.map((s) => (
                  <SelectItem key={s} value={s}>r/{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={fetchRedditPosts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loadingReddit ? (
          <JobCardSkeletonGrid count={4} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No Reddit posts yet"
            description="Posts are fetched daily at 9AM."
          />
        ) : (
          <div className="card-stagger grid gap-3 sm:grid-cols-2">
            {posts.map((post) => (
              <RedditPostCard
                key={post.id}
                post={post}
                redditConnected={redditAccount.connected}
                telegramConnected={telegramConnected}
                onGenerateComment={handleGenerateComment}
                onSendToTelegram={handleSendToTelegram}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hacker News posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Hacker News</h2>
            {lastUpdatedHN && (
              <p className="text-xs text-muted-foreground mt-0.5">Last updated {formatRelativeDate(lastUpdatedHN)}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={hnSource} onValueChange={(v) => v !== null && setHnSource(v)}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="algolia">Hiring Thread</SelectItem>
                <SelectItem value="rss_jobs">Jobs RSS</SelectItem>
                <SelectItem value="rss_freelance">Freelance RSS</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={fetchHNPosts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loadingHN ? (
          <JobCardSkeletonGrid count={4} />
        ) : hnPosts.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No HN posts yet"
            description="HN hiring posts are fetched daily at 9AM."
          />
        ) : (
          <div className="card-stagger grid gap-3 sm:grid-cols-2">
            {hnPosts.map((post) => (
              <HNPostCard
                key={post.id}
                post={post}
                telegramConnected={telegramConnected}
                hnConnected={hnConnected}
                onSendToTelegram={handleSendToTelegram}
                onCommentHN={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Telegram posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Telegram channels</h2>
            {lastUpdatedTelegram && (
              <p className="text-xs text-muted-foreground mt-0.5">Last updated {formatRelativeDate(lastUpdatedTelegram)}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={telegramChannel} onValueChange={(v) => v !== null && setTelegramChannel(v)}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                {TELEGRAM_JOB_CHANNELS.map((ch) => (
                  <SelectItem key={ch} value={ch}>@{ch}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={fetchTelegramPosts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loadingTelegram ? (
          <JobCardSkeletonGrid count={4} />
        ) : telegramPosts.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No Telegram posts yet"
            description="Telegram job posts are scraped daily at 9AM."
          />
        ) : (
          <div className="card-stagger grid gap-3 sm:grid-cols-2">
            {telegramPosts.map((post) => (
              <TelegramPostCard
                key={post.id}
                post={post}
                telegramConnected={telegramConnected}
                onSendToTelegram={handleSendToTelegram}
              />
            ))}
          </div>
        )}
      </div>

      {commentModal.post && (
        <CommentPreviewModal
          open={commentModal.open}
          postId={commentModal.post.redditId}
          postTitle={commentModal.post.title}
          initialComment={commentModal.generating ? "Generating comment…" : commentModal.comment}
          onClose={() => setCommentModal({ open: false, post: null, comment: "", generating: false })}
        />
      )}

      {commentModal.generating && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm">Generating personalized comment...</span>
          </div>
        </div>
      )}
    </div>
  );
}
