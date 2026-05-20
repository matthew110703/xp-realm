"use client";

import { useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { JobCardSkeletonGrid } from "@/components/shared/loading-skeleton";
import { SourceTag } from "@/components/shared/source-tag";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { formatRelativeDate } from "@/lib/utils";
import type { SavedBookmark, JobSource } from "@/types/job.types";

const SOURCE_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "api", label: "API Jobs" },
  { value: "scrape", label: "Scraped" },
  { value: "reddit", label: "Reddit" },
];

export default function BookmarksPage() {
  const [source, setSource] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { bookmarks, loading, removeBookmarks } = useBookmarks(source === "all" ? undefined : source);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    await removeBookmarks(ids);
    setSelected(new Set());
    toast.success(`${ids.length} bookmark${ids.length > 1 ? "s" : ""} removed`);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Bookmarks</h1>
          <p className="text-sm text-muted-foreground mt-1">Your saved opportunities</p>
        </div>
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete {selected.size}
          </Button>
        )}
      </div>

      <Tabs value={source} onValueChange={(v) => { setSource(v); setSelected(new Set()); }}>
        <TabsList className="bg-muted h-9">
          {SOURCE_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <JobCardSkeletonGrid count={6} />
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Browse jobs and click the bookmark icon to save opportunities here."
          action={{ label: "Browse jobs", href: "/jobs" }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((b) => (
            <BookmarkCard
              key={b.id}
              bookmark={b}
              selected={selected.has(b.id)}
              onToggleSelect={() => toggleSelect(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkCard({
  bookmark,
  selected,
  onToggleSelect,
}: {
  bookmark: SavedBookmark;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <Card
      className={`border-border/50 transition-colors ${selected ? "border-primary/50 bg-primary/5" : "hover:border-primary/20"}`}
      onClick={onToggleSelect}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => e.key === " " && onToggleSelect()}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold truncate leading-snug">{bookmark.title}</h3>
          <div className={`h-4 w-4 rounded border shrink-0 mt-0.5 transition-colors ${selected ? "bg-primary border-primary" : "border-border"}`} />
        </div>
        {bookmark.company && (
          <p className="text-xs text-muted-foreground truncate">{bookmark.company}</p>
        )}
        <div className="flex flex-wrap gap-1.5">
          <SourceTag source={bookmark.source as JobSource} />
          {bookmark.jobType && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">{bookmark.jobType}</Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>{bookmark.location ?? "Remote"}</span>
          <span>Saved {formatRelativeDate(bookmark.savedAt)}</span>
        </div>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "sm" }) + " w-full h-7 text-xs"}
          onClick={(e) => e.stopPropagation()}
        >
          View job
        </a>
      </CardContent>
    </Card>
  );
}
