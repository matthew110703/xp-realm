"use client";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RESTCOUNTRIES_API } from "@/constants/api.constants";

interface Country { name: { common: string }; cca2: string }
interface FormData { name: string; country: string; city: string; portfolioUrl: string }

interface Props {
  form: UseFormReturn<FormData>;
}

export function PersonalInfoStep({ form }: Props) {
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const { register, setValue, formState: { errors } } = form;

  useEffect(() => {
    fetch(`${RESTCOUNTRIES_API}/all?fields=name,cca2`)
      .then((r) => r.json())
      .then((data: Country[]) => {
        const sorted = data
          .map((c) => ({ code: c.cca2, name: c.name.common }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-heading font-semibold">Personal info</h2>
        <p className="text-sm text-muted-foreground mt-1">Tell us a bit about yourself</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Alex Chen" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Select onValueChange={(v: string | null) => v !== null && setValue("country", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Manila, Lagos, Lahore..." {...register("city")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portfolioUrl">Portfolio / GitHub URL</Label>
          <Input id="portfolioUrl" type="url" placeholder="https://yoursite.com" {...register("portfolioUrl")} />
          {errors.portfolioUrl && <p className="text-xs text-destructive">{errors.portfolioUrl.message}</p>}
        </div>
      </div>
    </div>
  );
}
