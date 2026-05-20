"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { APIJob } from "@/types/job.types";

interface Props {
  job: APIJob | { title: string; url: string; source: string; company?: string | null; jobType?: string | null; location?: string | null; salary?: string | null; description?: string | null; tags?: string[]; postedAt?: string | null; externalId?: string | null };
  isBookmarked?: boolean;
  onToggle?: (bookmarked: boolean) => void;
}

export function BookmarkButton({ job, isBookmarked: initialBookmarked = false, onToggle }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    if (bookmarked) {
      const res = await fetch("/api/bookmarks?" + new URLSearchParams({ url: job.url }), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [] }),
      });
      if (res.ok) {
        setBookmarked(false);
        onToggle?.(false);
        toast.success("Bookmark removed");
      }
    } else {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: job.source,
          externalId: "externalId" in job ? job.externalId : ("id" in job ? job.id : null),
          title: job.title,
          company: job.company,
          url: job.url,
          jobType: job.jobType,
          location: job.location,
          salary: job.salary,
          description: job.description,
          tags: job.tags ?? [],
          postedAt: job.postedAt,
        }),
      });
      if (res.ok) {
        setBookmarked(true);
        onToggle?.(true);
        toast.success("Bookmarked!");
      }
    }
    setLoading(false);
  }

  return (
    <Tooltip>
      <TooltipTrigger
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        onClick={(e) => { e.stopPropagation(); toggle(); }}
        disabled={loading}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark this job"}
      >
        {bookmarked
          ? <BookmarkCheck className="h-4 w-4 text-primary" />
          : <Bookmark className="h-4 w-4 text-muted-foreground" />
        }
      </TooltipTrigger>
      <TooltipContent>{bookmarked ? "Remove bookmark" : "Save job"}</TooltipContent>
    </Tooltip>
  );
}
