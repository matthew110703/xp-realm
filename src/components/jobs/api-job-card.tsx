"use client";

import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SourceTag } from "@/components/shared/source-tag";
import { BookmarkButton } from "./bookmark-button";
import { formatRelativeDate, getInitials, cn } from "@/lib/utils";
import type { APIJob } from "@/types/job.types";

const JOB_TYPE_ACCENT = ["part-time", "freelance", "contract"];

interface Props {
  job: APIJob;
}

export function APIJobCard({ job }: Props) {
  const isPriority = job.jobType && JOB_TYPE_ACCENT.includes(job.jobType);
  const href = `/jobs/${encodeURIComponent(job.id)}?source=api`;

  function storeJob() {
    try {
      sessionStorage.setItem(`xprealm-job-${job.id}`, JSON.stringify(job));
    } catch {}
  }

  return (
    <Link href={href} prefetch onClick={storeJob} className="block group">
      <Card
        className={cn(
          "border-border/50 hover:border-primary/30 transition-all duration-200",
          "hover:shadow-lg hover:shadow-primary/5"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 rounded-md shrink-0 border border-border">
                <AvatarImage src={job.companyLogo ?? undefined} alt={job.company ?? ""} />
                <AvatarFallback className="rounded-md bg-muted text-xs font-medium">
                  {getInitials(job.company ?? "?")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate group-hover:text-primary/90 transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{job.company}</p>
              </div>
            </div>
            <BookmarkButton job={job} />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.jobType && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-1.5 py-0",
                  isPriority ? "border-primary/40 text-primary" : "text-muted-foreground"
                )}
              >
                {job.jobType}
              </Badge>
            )}
            {job.category && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">{job.category}</Badge>
            )}
            <SourceTag source={job.source} provider={job.provider} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            {job.postedAt && (
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Calendar className="h-3 w-3" />
                <span>{formatRelativeDate(job.postedAt)}</span>
              </div>
            )}
          </div>

          {job.salary && (
            <p className="text-xs text-primary mt-2 font-mono">{job.salary}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
