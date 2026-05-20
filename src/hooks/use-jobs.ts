"use client";

import { useState, useEffect, useCallback } from "react";
import type { APIJob, JobFilters } from "@/types/job.types";

export function useJobs(initialFilters: JobFilters = {}) {
  const [jobs, setJobs] = useState<APIJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>(initialFilters);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.jobType) params.set("jobType", filters.jobType);
    if (filters.category) params.set("category", filters.category);
    if (filters.datePosted) params.set("datePosted", filters.datePosted);

    const res = await fetch(`/api/jobs/api?${params}`);
    const data = await res.json() as { jobs: APIJob[]; total: number };
    setJobs(data.jobs ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return { jobs, total, loading, filters, setFilters, refetch: fetchJobs };
}
