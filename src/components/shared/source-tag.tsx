import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JobSource } from "@/types/job.types";

interface Props {
  source: JobSource;
  provider?: string;
  className?: string;
}

const SOURCE_STYLES: Record<string, string> = {
  remotive: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  jobicy: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  adzuna: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  himalayas: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  arbeitnow: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  api: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  scrape: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  reddit: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  hn: "bg-amber-600/10 text-amber-500 border-amber-600/20",
  telegram: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

const LABELS: Record<string, string> = {
  remotive: "Remotive",
  jobicy: "Jobicy",
  adzuna: "Adzuna",
  himalayas: "Himalayas",
  arbeitnow: "Arbeitnow",
  api: "API",
  scrape: "Scraped",
  reddit: "Reddit",
  hn: "HN",
  telegram: "Telegram",
};

export function SourceTag({ source, provider, className }: Props) {
  const key = provider ?? source;
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-mono px-1.5 py-0.5", SOURCE_STYLES[key] ?? SOURCE_STYLES.api, className)}
    >
      {LABELS[key] ?? key}
    </Badge>
  );
}
