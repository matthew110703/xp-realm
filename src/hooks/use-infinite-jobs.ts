"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { APIJob, JobFilters } from "@/types/job.types";

const LIMIT = 20;

export function useInfiniteJobs(initialFilters: JobFilters = {}) {
  const [jobs, setJobs] = useState<APIJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFiltersState] = useState<JobFilters>(initialFilters);
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);
  const pageRef = useRef(1);
  const filtersRef = useRef({ ...filters, keyword: debouncedKeyword });

  // Debounce keyword changes
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(filters.keyword), 400);
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  // Keep filter ref in sync for use inside callbacks
  useEffect(() => {
    filtersRef.current = { ...filters, keyword: debouncedKeyword };
  }, [filters, debouncedKeyword]);

  const fetchPage = useCallback(async (pageNum: number) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    const f = filtersRef.current;
    const params = new URLSearchParams({ page: String(pageNum), limit: String(LIMIT) });
    if (f.keyword) params.set("keyword", f.keyword);
    if (f.jobType) params.set("jobType", f.jobType);
    if (f.category) params.set("category", f.category);
    if (f.datePosted) params.set("datePosted", f.datePosted);

    try {
      const res = await fetch(`/api/jobs/api?${params}`);
      const data = await res.json() as { jobs: APIJob[]; hasMore: boolean };
      setJobs((prev) => pageNum === 1 ? (data.jobs ?? []) : [...prev, ...(data.jobs ?? [])]);
      setHasMore(data.hasMore ?? false);
    } catch {
      // keep previous state on error
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // Reset and refetch when filters change (excluding keyword — that uses debounce)
  useEffect(() => {
    pageRef.current = 1;
    setJobs([]);
    setHasMore(true);
    fetchPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.jobType, filters.category, filters.datePosted, debouncedKeyword, fetchPage]);

  // IntersectionObserver loads next page when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchingRef.current && hasMore) {
          pageRef.current += 1;
          fetchPage(pageRef.current);
        }
      },
      { threshold: 0.1 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, fetchPage]);

  function setFilters(f: JobFilters) {
    setFiltersState(f);
  }

  return { jobs, loading, hasMore, filters, setFilters, sentinelRef };
}
