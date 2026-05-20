"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profileSchema, type ProfileInput } from "@/validations/profile.schema";
import type { UserData } from "@/types/profile.types";

interface Props {
  user: UserData;
  onSaved?: () => void;
}

export function ProfileForm({ user, onSaved }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileInput>,
    defaultValues: {
      name: user.name ?? "",
      country: user.country ?? "",
      city: user.city ?? "",
      portfolioUrl: user.portfolioUrl ?? "",
      bio: user.profile?.bio ?? "",
      payRangeMin: user.payRangeMin ?? 0,
      payRangeMax: user.payRangeMax ?? 5000,
      currency: user.currency ?? "USD",
      jobTypes: user.profile?.jobTypes ?? [],
      categories: user.profile?.categories ?? [],
      parsedSkills: user.profile?.parsedSkills ?? [],
    },
  });

  useEffect(() => {
    reset({
      name: user.name ?? "",
      country: user.country ?? "",
      city: user.city ?? "",
      portfolioUrl: user.portfolioUrl ?? "",
      bio: user.profile?.bio ?? "",
      payRangeMin: user.payRangeMin ?? 0,
      payRangeMax: user.payRangeMax ?? 5000,
      currency: user.currency ?? "USD",
      jobTypes: user.profile?.jobTypes ?? [],
      categories: user.profile?.categories ?? [],
      parsedSkills: user.profile?.parsedSkills ?? [],
    });
  }, [user, reset]);

  async function onSubmit(data: ProfileInput) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Profile saved");
      onSaved?.();
    } else {
      toast.error("Failed to save profile");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolioUrl">Portfolio / GitHub URL</Label>
        <Input id="portfolioUrl" type="url" placeholder="https://" {...register("portfolioUrl")} />
        {errors.portfolioUrl && <p className="text-xs text-destructive">{errors.portfolioUrl.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={3} placeholder="Brief intro..." {...register("bio")} />
        {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} size="sm">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Save changes
      </Button>
    </form>
  );
}
