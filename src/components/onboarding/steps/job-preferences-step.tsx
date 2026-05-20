"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JOB_TYPES, JOB_CATEGORIES } from "@/constants/jobs.constants";
import { cn } from "@/lib/utils";

interface Props {
  jobTypes: string[];
  categories: string[];
  payRangeMin: number;
  payRangeMax: number;
  currency: string;
  onJobTypesChange: (v: string[]) => void;
  onCategoriesChange: (v: string[]) => void;
  onPayRangeChange: (min: number, max: number) => void;
  onCurrencyChange: (v: string) => void;
}

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "NGN", "PKR", "PHP", "INR", "BRL"];

export function JobPreferencesStep({
  jobTypes, categories, payRangeMin, payRangeMax, currency,
  onJobTypesChange, onCategoriesChange, onPayRangeChange, onCurrencyChange,
}: Props) {
  const [range, setRange] = useState([payRangeMin, payRangeMax]);

  function toggleJobType(value: string) {
    const next = jobTypes.includes(value)
      ? jobTypes.filter((t) => t !== value)
      : [...jobTypes, value];
    onJobTypesChange(next);
  }

  function toggleCategory(value: string) {
    const next = categories.includes(value)
      ? categories.filter((c) => c !== value)
      : [...categories, value];
    onCategoriesChange(next);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-semibold">Job preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">What kind of work are you looking for?</p>
      </div>

      <div className="space-y-2">
        <Label>Job types</Label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((jt) => (
            <Badge
              key={jt.value}
              variant={jobTypes.includes(jt.value) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                jobTypes.includes(jt.value) ? "bg-primary text-primary-foreground" : "hover:border-primary/50"
              )}
              onClick={() => toggleJobType(jt.value)}
            >
              {jt.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-2">
          {JOB_CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant={categories.includes(cat) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                categories.includes(cat) ? "bg-primary text-primary-foreground" : "hover:border-primary/50"
              )}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Pay range (monthly)</Label>
          <Select value={currency} onValueChange={(v) => v !== null && onCurrencyChange(v)}>
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Slider
          min={0}
          max={20000}
          step={100}
          value={range}
          onValueChange={(v) => {
            const vals = v as number[];
            setRange(vals);
            onPayRangeChange(vals[0], vals[1]);
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currency} {range[0].toLocaleString()}</span>
          <span>{currency} {range[1].toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
