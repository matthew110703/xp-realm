"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ExternalLink, MapPin, Calendar, DollarSign, ChevronDown, Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BookmarkButton } from "@/components/jobs/bookmark-button";
import { SourceTag } from "@/components/shared/source-tag";
import { CountryInfoPanel } from "@/components/country-info/country-info-panel";
import { formatRelativeDate } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import type { APIJob, ScrapedJob, RedditJobPost } from "@/types/job.types";

type AnyJob = APIJob | ScrapedJob | (RedditJobPost & { source: "reddit" });

function extractCountryCode(location?: string | null): string | null {
  if (!location) return null;
  const l = location.toLowerCase();
  if (l.includes("united states") || l.includes("usa") || l.match(/\bus\b/)) return "US";
  if (l.includes("united kingdom") || l.includes("uk") || l.includes("gb")) return "GB";
  if (l.includes("canada")) return "CA";
  if (l.includes("germany")) return "DE";
  if (l.includes("australia")) return "AU";
  if (l.includes("india")) return "IN";
  if (l.includes("brazil")) return "BR";
  return null;
}

export default function JobDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = decodeURIComponent(params.id as string);
  const source = searchParams.get("source") ?? "api";

  const [job, setJob] = useState<AnyJob | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descOverflows, setDescOverflows] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();

  // Detect whether the description overflows the collapsed max-height
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    setDescOverflows(el.scrollHeight > el.clientHeight + 2);
  }, [job]);

  useEffect(() => {
    const stored = sessionStorage.getItem(`xprealm-job-${id}`);
    if (stored) {
      try {
        setJob(JSON.parse(stored) as AnyJob);
      } catch {}
    }
  }, [id]);

  useEffect(() => {
    if (!job) return;
    const title = "title" in job ? job.title : "";
    const company = "company" in job ? (job.company ?? "Unknown") : "Unknown";
    document.title = `${title} at ${company} — XPRealm`;
    return () => {
      document.title = "XPRealm";
    };
  }, [job]);

  if (!job) {
    return (
      <div className="space-y-6">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Briefcase className="h-10 w-10 mb-3 opacity-20" />
          <p className="font-medium">Job not found</p>
          <p className="text-sm mt-1">Go back to jobs and click a listing to view its details.</p>
        </div>
      </div>
    );
  }

  const isReddit = source === "reddit";
  const reddit = isReddit ? (job as RedditJobPost & { source: "reddit" }) : null;

  const title = "title" in job ? job.title : "";
  const company = "company" in job ? job.company : null;
  const jobUrl = "url" in job ? job.url : "#";
  const location = isReddit
    ? (reddit?.extractedJob?.location ?? null)
    : ("location" in job ? job.location : null);
  const salary = isReddit
    ? (reddit?.extractedJob?.salary ?? null)
    : ("salary" in job ? job.salary : null);
  const description = isReddit
    ? (reddit?.body ?? null)
    : ("description" in job ? job.description : null);
  const jobType = isReddit
    ? (reddit?.extractedJob?.jobType ?? null)
    : ("jobType" in job ? job.jobType : null);
  const postedAt = isReddit
    ? (reddit?.fetchedAt ?? null)
    : ("postedAt" in job ? job.postedAt : null);
  const tags: string[] = isReddit
    ? (reddit?.extractedJob?.skills ?? [])
    : ("tags" in job ? (job as APIJob | ScrapedJob).tags : []);

  const userSkills: string[] = profile?.profile?.parsedSkills ?? [];
  const matchCount = tags.filter((t) =>
    userSkills.some((s: string) => s.toLowerCase() === t.toLowerCase())
  ).length;
  const matchPercent = tags.length > 0 ? Math.round((matchCount / tags.length) * 100) : 0;

  const countryCode = extractCountryCode(location);
  const truncatedTitle = title.length > 40 ? `${title.slice(0, 40)}…` : title;

  const bookmarkJob = {
    title,
    url: jobUrl,
    source,
    company,
    jobType,
    location,
    salary,
    description,
    tags,
    postedAt,
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[280px]">{truncatedTitle}</span>
      </nav>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* ── Left column ── */}
        <div className="space-y-6">

          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {source === "api" && (job as APIJob).companyLogo && (
                <img
                  src={(job as APIJob).companyLogo!}
                  alt={company ?? ""}
                  className="h-12 w-12 rounded-lg border border-border object-contain bg-muted p-1 shrink-0"
                />
              )}
              <div>
                <h1 className="text-xl font-heading font-bold leading-snug">{title}</h1>
                {company && <p className="text-muted-foreground mt-0.5">{company}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <SourceTag
                source={source as "api" | "scrape" | "reddit"}
                provider={source === "api" ? (job as APIJob).provider : undefined}
              />
              {jobType && <Badge variant="outline" className="text-xs">{jobType}</Badge>}
              {source === "api" && (job as APIJob).category && (
                <Badge variant="secondary" className="text-xs">{(job as APIJob).category}</Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {location}
                </span>
              )}
              {salary && (
                <span className="flex items-center gap-1.5 text-primary font-mono">
                  <DollarSign className="h-3.5 w-3.5" /> {salary}
                </span>
              )}
              {postedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {formatRelativeDate(postedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {description && (
            <div>
              <h2 className="text-base font-semibold mb-3">About this role</h2>
              <div className="relative">
                <div
                  ref={descRef}
                  className="text-sm text-muted-foreground leading-relaxed overflow-hidden transition-[max-height] duration-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_p]:mb-3 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-foreground [&_strong]:text-foreground [&_b]:text-foreground"
                  style={{ maxHeight: descExpanded ? "9999px" : "14rem" }}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
                {!descExpanded && descOverflows && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-background to-transparent pointer-events-none" />
                )}
              </div>
              {descOverflows && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-2 text-xs text-primary hover:underline font-medium"
                >
                  {descExpanded ? "See less" : "See more"}
                </button>
              )}
            </div>
          )}

          {/* Skills */}
          {tags.length > 0 && (
            <div>
              <h2 className="text-base font-semibold mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const matched = userSkills.some((s: string) => s.toLowerCase() === tag.toLowerCase());
                  return (
                    <Badge
                      key={tag}
                      variant={matched ? "default" : "secondary"}
                      className={matched ? "border-primary/50" : ""}
                    >
                      {tag}
                    </Badge>
                  );
                })}
              </div>
              {userSkills.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Highlighted badges match your profile skills.
                </p>
              )}
            </div>
          )}

          {/* Apply */}
          <div>
            <h2 className="text-base font-semibold mb-3">How to Apply</h2>
            <a
              href={jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "lg" }) + " gap-2"}
            >
              Apply Now <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* ── Right column (sticky) ── */}
        <div className="lg:sticky lg:top-20 space-y-4">

          {/* CTAs */}
          <div className="flex gap-2">
            <a
              href={jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants() + " flex-1 gap-2"}
            >
              Apply Now <ExternalLink className="h-4 w-4" />
            </a>
            <BookmarkButton job={bookmarkJob as Parameters<typeof BookmarkButton>[0]["job"]} />
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border/50 p-4 space-y-2.5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Job Summary
            </p>
            {salary && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Salary</span>
                <span className="font-mono text-primary text-xs text-right">{salary}</span>
              </div>
            )}
            {jobType && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Type</span>
                <span className="text-right capitalize">{jobType}</span>
              </div>
            )}
            {location && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Location</span>
                <span className="text-right max-w-[60%]">{location}</span>
              </div>
            )}
            {postedAt && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Posted</span>
                <span className="text-right">{formatRelativeDate(postedAt)}</span>
              </div>
            )}
            {source === "api" && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Source</span>
                <span className="text-right capitalize">{(job as APIJob).provider}</span>
              </div>
            )}
            {source === "reddit" && reddit && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Posted by</span>
                <span className="text-right">u/{reddit.author}</span>
              </div>
            )}
          </div>

          {/* Match Score */}
          {tags.length > 0 && (
            <div className="rounded-lg border border-border/50 p-4 space-y-2.5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Match Score
              </p>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Skill overlap</span>
                <span className="font-mono font-medium">{matchCount}/{tags.length}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${matchPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{matchPercent}% match with your profile</p>
            </div>
          )}

          {/* Country Info */}
          {countryCode && (
            <Collapsible open={countryOpen} onOpenChange={setCountryOpen}>
              <CollapsibleTrigger
                className={
                  buttonVariants({ variant: "outline", size: "sm" }) +
                  " w-full justify-between"
                }
              >
                Country info &amp; freelancer tips
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${countryOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CountryInfoPanel countryCode={countryCode} />
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
