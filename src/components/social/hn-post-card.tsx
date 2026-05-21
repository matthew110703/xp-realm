"use client";

import { useState } from "react";
import { ExternalLink, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { HNCommentModal } from "@/components/hn/hn-comment-modal";
import { formatRelativeDate, truncate } from "@/lib/utils";
import type { HNPost } from "@/types/hn.types";

interface Props {
  post: HNPost;
  telegramConnected: boolean;
  hnConnected: boolean;
  onSendToTelegram: (post: HNPost) => void;
  onCommentHN: (post: HNPost) => void;
}

interface ExtractedJob {
  jobType?: string;
  skills?: string[];
  company?: string;
}

const SOURCE_LABELS: Record<string, string> = {
  algolia: "HN Hiring Thread",
  rss_jobs: "HN Jobs RSS",
  rss_freelance: "HN Freelance RSS",
};

export function HNPostCard({ post, telegramConnected, hnConnected, onSendToTelegram, onCommentHN: _ }: Props) {
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const extracted = post.extractedJob as ExtractedJob | null;
  const hnUrl = `https://news.ycombinator.com/item?id=${post.hnId}`;

  return (
    <Card className="border-border/50 hover:border-amber-500/20 transition-all duration-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-mono px-1.5 py-0.5 bg-amber-600/10 text-amber-500 border-amber-600/20">
                HN
              </Badge>
              <span className="text-xs text-muted-foreground">{SOURCE_LABELS[post.source] ?? post.source}</span>
              {post.threadMonth && (
                <span className="text-xs text-muted-foreground">{post.threadMonth}</span>
              )}
            </div>
            <p className="text-sm font-semibold leading-snug">
              {extracted?.company ?? `u/${post.author ?? "unknown"}`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {post.author && `u/${post.author} · `}{formatRelativeDate(post.fetchedAt)}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {truncate(post.rawText, 200)}
        </p>

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

        <div className="flex items-center justify-end gap-2">
          <a
            href={hnUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "sm", variant: "outline" }) + " h-7 text-xs"}
          >
            View <ExternalLink className="ml-1 h-3 w-3" />
          </a>
          {telegramConnected && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onSendToTelegram(post)}>
              Send to Telegram
            </Button>
          )}
          {hnConnected && (
            <Button size="sm" className="h-7 text-xs" onClick={() => setCommentModalOpen(true)}>
              <MessageSquare className="mr-1 h-3 w-3" /> Comment
            </Button>
          )}
        </div>
      </CardContent>

      {hnConnected && (
        <HNCommentModal
          open={commentModalOpen}
          hnId={post.hnId}
          postText={post.rawText}
          onClose={() => setCommentModalOpen(false)}
        />
      )}
    </Card>
  );
}
