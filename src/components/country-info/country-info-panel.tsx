"use client";

import { useEffect, useState } from "react";
import { Loader2, Globe, CreditCard, FileText, Lightbulb, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CountryInfo } from "@/types/country.types";

interface Props {
  countryCode: string;
}

export function CountryInfoPanel({ countryCode }: Props) {
  const [info, setInfo] = useState<CountryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/country-info?code=${countryCode}`)
      .then((r) => r.json())
      .then((d) => { setInfo(d.info); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [countryCode]);

  if (loading) return (
    <div className="flex items-center gap-2 py-6 px-4 text-muted-foreground text-sm">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading country data...
    </div>
  );

  if (error || !info) return (
    <p className="text-sm text-muted-foreground py-4 px-4">Could not load country info.</p>
  );

  return (
    <div className="mt-3 space-y-4 rounded-lg border border-border/50 p-4 text-sm">

      {/* Country header */}
      <div className="flex items-center gap-2">
        {info.flag && (
          <img src={info.flag} alt={info.countryName} className="h-5 w-7 object-cover rounded-sm" />
        )}
        <span className="font-semibold">{info.countryName}</span>
        <span className="text-muted-foreground text-xs">·</span>
        <span className="text-xs text-muted-foreground">{info.currency}</span>
        {info.region && (
          <span className="text-xs text-muted-foreground ml-auto">{info.region}</span>
        )}
      </div>

      {/* Teleport scores */}
      {info.teleportScores !== null ? (
        <div className="space-y-3">

          {/* Overall score badge */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/5">
              <span className="font-mono text-sm font-bold text-primary">
                {info.teleportScores.teleportCityScore.toFixed(0)}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium">Quality of Life Score</p>
              <p className="text-xs text-muted-foreground">out of 100 · Teleport</p>
            </div>
          </div>

          {/* Category bars */}
          <div className="space-y-1.5">
            {info.teleportScores.categories.map((cat) => (
              <div key={cat.name} className="grid grid-cols-[1fr_auto] items-center gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground truncate">{cat.name}</p>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(cat.scoreOutOf10 / 10) * 100}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
                <span className="font-mono text-xs text-muted-foreground w-6 text-right">
                  {cat.scoreOutOf10.toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Housing cost + cost of living items */}
          {info.teleportDetails !== null && (
            <div className="space-y-1.5 border-t border-border/50 pt-3">
              {info.teleportDetails.housingCostRange.max > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Housing / month
                  </span>
                  <span className="font-mono">
                    ${info.teleportDetails.housingCostRange.min.toLocaleString()} – ${info.teleportDetails.housingCostRange.max.toLocaleString()}
                  </span>
                </div>
              )}
              {info.teleportDetails.costOfLivingItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">{item.label}</span>
                  <span className="font-mono ml-2 shrink-0">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/70 italic">
          Detailed city scores unavailable for this location
        </p>
      )}

      {/* Payment methods */}
      {info.availablePaymentMethods.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium mb-1.5">
            <CreditCard className="h-3.5 w-3.5" /> Payment methods
          </div>
          <div className="flex flex-wrap gap-1">
            {info.availablePaymentMethods.map((m) => (
              <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Work permit */}
      {info.workPermitNotes && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium mb-1">
            <Globe className="h-3.5 w-3.5" /> Work permit
          </div>
          <p className="text-xs text-muted-foreground">{info.workPermitNotes}</p>
        </div>
      )}

      {/* Tax / registration */}
      {info.taxRegistrationNotes && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium mb-1">
            <FileText className="h-3.5 w-3.5" /> Tax / registration
          </div>
          <p className="text-xs text-muted-foreground">{info.taxRegistrationNotes}</p>
        </div>
      )}

      {/* Freelancer tips */}
      {info.freelancerTips.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium mb-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-primary" /> Tips
          </div>
          <ul className="space-y-1">
            {info.freelancerTips.map((tip, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                <span className="text-primary shrink-0">·</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
