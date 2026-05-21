"use client";

import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SourceTag } from "@/components/shared/source-tag";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { BookmarkButton } from "./bookmark-button";
import { truncate } from "@/lib/utils";
import type { ScrapedJob } from "@/types/job.types";

interface Props {
  job: ScrapedJob;
}

export function ScrapedJobCard({ job }: Props) {
  const href = `/jobs/${encodeURIComponent(job.id)}?source=scrape`;

  function storeJob() {
    try {
      sessionStorage.setItem(`xprealm-job-${job.id}`, JSON.stringify(job));
    } catch {}
  }

  return (
    <Card className="border-border/50 hover:border-amber-500/20 transition-all duration-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={href}
              prefetch
              onClick={storeJob}
              className="text-sm font-semibold truncate block hover:text-primary transition-colors"
            >
              {job.title}
            </Link>
            {job.company && <p className="text-xs text-muted-foreground truncate">{job.company}</p>}
          </div>
          <BookmarkButton job={job} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <SourceTag source="scrape" />
          <ConfidenceBadge score={job.confidenceScore} />
          {job.jobType && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">{job.jobType}</Badge>
          )}
        </div>

        {job.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {truncate(job.description, 120)}
          </p>
        )}

        <div className="flex flex-wrap gap-1">
          {job.skills.slice(0, 4).map((s) => (
            <Badge key={s} variant="secondary" className="text-xs px-1.5 py-0">{s}</Badge>
          ))}
        </div>

        {job.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {job.location}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "sm" }) + " flex-1 h-7 text-xs"}
          >
            Apply Now <ExternalLink className="ml-1 h-3 w-3" />
          </a>
          <a
            href={job.rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "sm", variant: "outline" }) + " h-7 text-xs"}
          >
            Source
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
