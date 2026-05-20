"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JOB_TYPES, JOB_CATEGORIES } from "@/constants/jobs.constants";
import type { JobFilters } from "@/types/job.types";

interface Props {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
}

const DATE_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "24h", label: "Last 24 hours" },
  { value: "week", label: "Last week" },
  { value: "month", label: "Last month" },
];

export function JobFilters({ filters, onFiltersChange }: Props) {
  const [keyword, setKeyword] = useState(filters.keyword ?? "");

  function handleSearch() {
    onFiltersChange({ ...filters, keyword: keyword.trim() || undefined });
  }

  function clearFilters() {
    setKeyword("");
    onFiltersChange({});
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search jobs, skills, companies..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary" size="sm">Search</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.jobType ?? "all"}
          onValueChange={(v) => onFiltersChange({ ...filters, jobType: (v ?? "all") === "all" ? undefined : (v ?? undefined) })}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {JOB_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category ?? "all"}
          onValueChange={(v) => onFiltersChange({ ...filters, category: (v ?? "all") === "all" ? undefined : (v ?? undefined) })}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {JOB_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.datePosted ?? "any"}
          onValueChange={(v) => onFiltersChange({ ...filters, datePosted: v === "any" ? undefined : v as JobFilters["datePosted"] })}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Date posted" />
          </SelectTrigger>
          <SelectContent>
            {DATE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearFilters}>
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
