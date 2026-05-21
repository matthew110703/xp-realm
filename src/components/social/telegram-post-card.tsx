"use client";

import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatRelativeDate, truncate } from "@/lib/utils";
import type { TelegramPost } from "@/types/telegram.types";

interface Props {
  post: TelegramPost;
  telegramConnected: boolean;
  onSendToTelegram: (post: TelegramPost) => void;
}

interface ExtractedJob {
  jobType?: string;
  skills?: string[];
  company?: string;
  title?: string;
}

export function TelegramPostCard({ post, telegramConnected, onSendToTelegram }: Props) {
  const extracted = post.extractedJob as ExtractedJob | null;
  const displayDate = post.postedAt ?? post.fetchedAt;

  return (
    <Card className="border-border/50 hover:border-sky-500/20 transition-all duration-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-mono px-1.5 py-0.5 bg-sky-500/10 text-sky-400 border-sky-500/20">
                Telegram
              </Badge>
              <span className="text-xs text-muted-foreground">@{post.channel}</span>
            </div>
            <p className="text-sm font-semibold leading-snug">
              {extracted?.title ?? extracted?.company ?? `@${post.channel}`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatRelativeDate(displayDate)}
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
          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "sm", variant: "outline" }) + " h-7 text-xs"}
            >
              View <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          )}
          {telegramConnected && (
            <Button size="sm" className="h-7 text-xs" onClick={() => onSendToTelegram(post)}>
              Send to My Telegram
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
