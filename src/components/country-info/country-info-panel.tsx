"use client";

import { useEffect, useState } from "react";
import { Loader2, Globe, CreditCard, FileText, Lightbulb } from "lucide-react";
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
      <div className="flex items-center gap-2">
        {info.flag && <img src={info.flag} alt={info.name} className="h-5 w-7 object-cover rounded-sm" />}
        <span className="font-semibold">{info.name}</span>
        <span className="text-muted-foreground text-xs">·</span>
        <span className="text-xs text-muted-foreground">{info.currency} {info.currencySymbol}</span>
        {info.region && (
          <span className="text-xs text-muted-foreground ml-auto">{info.region}</span>
        )}
      </div>

      {(info.costOfLivingIndex || info.rentIndex) && (
        <div className="flex gap-4 text-xs">
          {info.costOfLivingIndex && (
            <div>
              <p className="text-muted-foreground">Cost of living</p>
              <p className="font-mono font-semibold">{info.costOfLivingIndex.toFixed(1)}</p>
            </div>
          )}
          {info.rentIndex && (
            <div>
              <p className="text-muted-foreground">Rent index</p>
              <p className="font-mono font-semibold">{info.rentIndex.toFixed(1)}</p>
            </div>
          )}
        </div>
      )}

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

      {info.workPermitNotes && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium mb-1">
            <Globe className="h-3.5 w-3.5" /> Work permit
          </div>
          <p className="text-xs text-muted-foreground">{info.workPermitNotes}</p>
        </div>
      )}

      {info.taxRegistrationNotes && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium mb-1">
            <FileText className="h-3.5 w-3.5" /> Tax / registration
          </div>
          <p className="text-xs text-muted-foreground">{info.taxRegistrationNotes}</p>
        </div>
      )}

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
