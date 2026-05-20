"use client";

import { useState } from "react";
import { ExternalLink, MapPin, Calendar, DollarSign, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SourceTag } from "@/components/shared/source-tag";
import { BookmarkButton } from "./bookmark-button";
import { CountryInfoPanel } from "@/components/country-info/country-info-panel";
import { formatRelativeDate } from "@/lib/utils";
import type { APIJob } from "@/types/job.types";

interface Props {
  job: APIJob | null;
  userSkills?: string[];
  onClose: () => void;
}

export function JobDetailPanel({ job, userSkills = [], onClose }: Props) {
  const [countryOpen, setCountryOpen] = useState(false);

  const countryCode = extractCountryCode(job?.location);

  return (
    <Sheet open={!!job} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto"
        aria-label="Job details"
      >
        {job && (
          <>
            <SheetHeader className="space-y-3 pb-4 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle className="text-base font-heading leading-tight">{job.title}</SheetTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">{job.company}</p>
                </div>
                <BookmarkButton job={job} />
              </div>

              <div className="flex flex-wrap gap-2">
                <SourceTag source={job.source} provider={job.provider} />
                {job.jobType && <Badge variant="outline" className="text-xs">{job.jobType}</Badge>}
                {job.category && <Badge variant="secondary" className="text-xs">{job.category}</Badge>}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-1 text-primary font-mono">
                    <DollarSign className="h-3 w-3" /> {job.salary}
                  </div>
                )}
                {job.postedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatRelativeDate(job.postedAt)}
                  </div>
                )}
              </div>
            </SheetHeader>

            <div className="py-4 space-y-4">
              {job.description && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <div
                    className="text-sm text-muted-foreground space-y-2 prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: highlightSkills(job.description, userSkills) }}
                  />
                </div>
              )}

              {job.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={`text-xs ${userSkills.some((s) => s.toLowerCase() === tag.toLowerCase()) ? "border-primary/40 text-primary" : ""}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {countryCode && (
                <Collapsible open={countryOpen} onOpenChange={setCountryOpen}>
                  <CollapsibleTrigger className={buttonVariants({ variant: "outline", size: "sm" }) + " w-full justify-between"}>
                    Country info & relocation details
                    <ChevronDown className={`h-4 w-4 transition-transform ${countryOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CountryInfoPanel countryCode={countryCode} />
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="flex gap-2 pt-2">
                <a href={job.url} target="_blank" rel="noopener noreferrer"
                  className={buttonVariants() + " flex-1"}>
                  Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function highlightSkills(html: string, skills: string[]): string {
  if (!skills.length) return html;
  let result = html;
  for (const skill of skills) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    result = result.replace(
      regex,
      `<mark class="bg-primary/20 text-primary rounded px-0.5">$&</mark>`
    );
  }
  return result;
}

function extractCountryCode(location?: string | null): string | null {
  if (!location) return null;
  const lower = location.toLowerCase();
  if (lower.includes("us") || lower.includes("united states") || lower.includes("usa")) return "US";
  if (lower.includes("uk") || lower.includes("united kingdom") || lower.includes("gb")) return "GB";
  if (lower.includes("canada")) return "CA";
  if (lower.includes("germany")) return "DE";
  if (lower.includes("australia")) return "AU";
  return null;
}
