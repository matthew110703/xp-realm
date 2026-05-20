import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  className?: string;
}

function getLevel(score: number): { label: string; className: string } {
  if (score >= 0.7) return { label: "High", className: "bg-primary/10 text-primary border-primary/20" };
  if (score >= 0.4) return { label: "Medium", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
  return { label: "Low", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
}

export function ConfidenceBadge({ score, className }: Props) {
  const { label, className: colorClass } = getLevel(score);
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={cn("text-xs px-1.5 py-0", colorClass, className)}>
          {label} confidence
        </Badge>
      </TooltipTrigger>
      <TooltipContent>AI extraction confidence: {(score * 100).toFixed(0)}%</TooltipContent>
    </Tooltip>
  );
}
