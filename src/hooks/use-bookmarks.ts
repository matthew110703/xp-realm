"use client";

import { useState, useEffect } from "react";
import type { SavedBookmark } from "@/types/job.types";

export function useBookmarks(source?: string) {
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetch() {
    setLoading(true);
    const params = source ? `?source=${source}` : "";
    const res = await window.fetch(`/api/bookmarks${params}`);
    const data = await res.json() as { bookmarks: SavedBookmark[] };
    setBookmarks(data.bookmarks ?? []);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, [source]);

  async function removeBookmarks(ids: string[]) {
    await window.fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setBookmarks((prev) => prev.filter((b) => !ids.includes(b.id)));
  }

  return { bookmarks, loading, removeBookmarks, refetch: fetch };
}
