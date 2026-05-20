"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RedditPostCard } from "@/components/jobs/reddit-post-card";
import { CommentPreviewModal } from "@/components/reddit/comment-preview-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { JobCardSkeletonGrid } from "@/components/shared/loading-skeleton";
import { formatRelativeDate } from "@/lib/utils";
import { REDDIT_JOB_SUBREDDITS } from "@/constants/jobs.constants";
import type { RedditPost } from "@/types/reddit.types";

interface RedditAccount {
  connected: boolean;
  username: string | null;
}

export default function SocialPage() {
  const [redditAccount, setRedditAccount] = useState<RedditAccount>({ connected: false, username: null });
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [subreddit, setSubreddit] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [commentModal, setCommentModal] = useState<{
    open: boolean;
    post: RedditPost | null;
    comment: string;
    generating: boolean;
  }>({ open: false, post: null, comment: "", generating: false });

  useEffect(() => {
    checkRedditAccount();
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [subreddit]);

  async function checkRedditAccount() {
    const res = await fetch("/api/profile");
    if (!res.ok) return;
    const data = await res.json() as { user: { accounts?: { provider: string }[] } };
    const redditAcc = data.user?.accounts?.find((a: { provider: string }) => a.provider === "reddit");
    setRedditAccount({ connected: !!redditAcc, username: null });
  }

  async function fetchPosts() {
    setLoading(true);
    const params = subreddit !== "all" ? `?subreddit=${subreddit}` : "";
    const res = await fetch(`/api/reddit/posts${params}`);
    const data = await res.json() as { posts: RedditPost[] };
    setPosts(data.posts ?? []);
    setLastUpdated(new Date());
    setLoading(false);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Social</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect and engage with the job community</p>
      </div>

      {/* Section A — Connect socials */}
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

          {["LinkedIn", "Twitter"].map((platform) => (
            <Card key={platform} className="border-border/50 opacity-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-xs font-bold">{platform[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{platform}</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Soon</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Section B — Reddit posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Reddit job posts</h2>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Last updated {formatRelativeDate(lastUpdated)}
              </p>
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
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={fetchPosts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <JobCardSkeletonGrid count={4} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No Reddit posts yet"
            description="Posts are fetched daily at 9AM. Check back later or ask your admin to trigger the cron."
          />
        ) : (
          <div className="card-stagger grid gap-3 sm:grid-cols-2">
            {posts.map((post) => (
              <RedditPostCard
                key={post.id}
                post={post}
                redditConnected={redditAccount.connected}
                onGenerateComment={handleGenerateComment}
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
