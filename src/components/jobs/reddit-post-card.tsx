"use client";

import Link from "next/link";
import { ArrowUp, MessageSquare, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { SourceTag } from "@/components/shared/source-tag";
import { formatRelativeDate, truncate } from "@/lib/utils";
import type { RedditPost } from "@/types/reddit.types";

interface Props {
  post: RedditPost;
  redditConnected: boolean;
  telegramConnected?: boolean;
  onGenerateComment: (post: RedditPost) => void;
  onSendToTelegram?: (post: RedditPost) => void;
}

interface ExtractedJob {
  jobType?: string;
  skills?: string[];
}

export function RedditPostCard({ post, redditConnected, telegramConnected, onGenerateComment, onSendToTelegram }: Props) {
  const extracted = post.extractedJob as ExtractedJob | null;
  const href = `/jobs/${encodeURIComponent(post.id)}?source=reddit`;

  function storePost() {
    try {
      sessionStorage.setItem(`xprealm-job-${post.id}`, JSON.stringify(post));
    } catch {}
  }

  return (
    <Card className="border-border/50 hover:border-orange-500/20 transition-all duration-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <SourceTag source="reddit" />
              <span className="text-xs text-muted-foreground">r/{post.subreddit}</span>
              {post.flair && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 border-orange-500/20 text-orange-400">
                  {post.flair}
                </Badge>
              )}
            </div>
            <Link
              href={href}
              prefetch
              onClick={storePost}
              className="text-sm font-semibold leading-snug hover:text-primary transition-colors block"
            >
              {post.title}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">
              u/{post.author} · {formatRelativeDate(post.fetchedAt)}
            </p>
          </div>
        </div>

        {post.body && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {truncate(post.body, 160)}
          </p>
        )}

        {extracted && (
          <div className="flex flex-wrap gap-1">
            {extracted.jobType && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">{extracted.jobType}</Badge>
            )}
            {(extracted.skills ?? []).slice(0, 4).map((s: string) => (
              <Badge key={s} variant="outline" className="text-xs px-1.5 py-0">{s}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /> {post.score}</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.commentCount}</span>
          </div>

          <div className="flex gap-2">
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "sm", variant: "outline" }) + " h-7 text-xs"}
            >
              Reddit <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            {telegramConnected && onSendToTelegram && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onSendToTelegram(post)}>
                Send to Telegram
              </Button>
            )}
            {redditConnected && (
              <Button size="sm" className="h-7 text-xs" onClick={() => onGenerateComment(post)}>
                Reply
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
