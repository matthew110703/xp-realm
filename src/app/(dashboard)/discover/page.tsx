"use client";

import { useState } from "react";
import { Compass, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrapedJobCard } from "@/components/jobs/scraped-job-card";
import { JobCardSkeletonGrid } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { ScrapedJob } from "@/types/job.types";

export default function DiscoverPage() {
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scrape() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/jobs/scrape");
    setLoading(false);

    if (!res.ok) {
      const err = await res.json() as { error: string };
      setError(err.error ?? "Scraping failed");
      return;
    }

    const data = await res.json() as { jobs: ScrapedJob[] };
    setJobs(data.jobs ?? []);
    setFetched(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Discover</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-extracted jobs from remote job boards</p>
        </div>
        <Button onClick={scrape} disabled={loading} size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Scraping..." : "Fetch jobs"}
        </Button>
      </div>

      <Alert className="border-amber-500/20 bg-amber-500/5">
        <AlertCircle className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-xs text-muted-foreground">
          These are AI-extracted results from job board pages. Accuracy may vary — always verify before applying.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <JobCardSkeletonGrid count={4} />
      ) : !fetched ? (
        <EmptyState
          icon={Compass}
          title="No results yet"
          description="Click 'Fetch jobs' to scrape remote job boards and extract opportunities with AI."
          action={{ label: "Fetch jobs", onClick: scrape }}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No jobs found"
          description="The scraper couldn't extract any valid job postings this time. Try again later."
          action={{ label: "Try again", onClick: scrape }}
        />
      ) : (
        <div className="card-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <ScrapedJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
