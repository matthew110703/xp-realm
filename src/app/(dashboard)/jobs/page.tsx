"use client";

import { Briefcase } from "lucide-react";
import { useInfiniteJobs } from "@/hooks/use-infinite-jobs";
import { APIJobCard } from "@/components/jobs/api-job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobCardSkeletonGrid, JobCardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export default function JobsPage() {
  const { jobs, loading, hasMore, filters, setFilters, sentinelRef } = useInfiniteJobs();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-heading font-bold">Jobs</h1>
        <p className="text-sm text-muted-foreground mt-1">Remote opportunities from across the web</p>
      </div>

      <JobFilters filters={filters} onFiltersChange={setFilters} />

      {jobs.length === 0 && loading ? (
        <JobCardSkeletonGrid />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="Try adjusting your filters or updating your skills in Settings to improve your matches."
          action={{ label: "Update skills", href: "/settings" }}
        />
      ) : (
        <>
          <div className="card-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <APIJobCard key={job.id} job={job} />
            ))}
          </div>

          <div ref={sentinelRef} className="py-2">
            {loading && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            )}
            {!hasMore && !loading && (
              <p className="text-center text-sm text-muted-foreground py-6">
                You&apos;ve seen all available listings. Check back tomorrow.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
