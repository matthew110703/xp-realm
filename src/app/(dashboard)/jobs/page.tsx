"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import { useJobs } from "@/hooks/use-jobs";
import { APIJobCard } from "@/components/jobs/api-job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobDetailPanel } from "@/components/jobs/job-detail-panel";
import { JobCardSkeletonGrid } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { APIJob } from "@/types/job.types";

export default function JobsPage() {
  const { jobs, loading, filters, setFilters } = useJobs();
  const [selected, setSelected] = useState<APIJob | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-heading font-bold">Jobs</h1>
        <p className="text-sm text-muted-foreground mt-1">Remote opportunities from across the web</p>
      </div>

      <JobFilters filters={filters} onFiltersChange={setFilters} />

      {loading ? (
        <JobCardSkeletonGrid />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="Try adjusting your filters or updating your skills in Settings to improve your matches."
          action={{ label: "Update skills", href: "/settings" }}
        />
      ) : (
        <div className="card-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <APIJobCard key={job.id} job={job} onClick={() => setSelected(job)} />
          ))}
        </div>
      )}

      <JobDetailPanel job={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
