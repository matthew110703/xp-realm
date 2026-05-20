"use client";

import { useState, useEffect } from "react";
import type { UserData } from "@/types/profile.types";

export function useProfile() {
  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile() {
    setLoading(true);
    const res = await fetch("/api/profile");
    const data = await res.json() as { user: UserData };
    setProfile(data.user ?? null);
    setLoading(false);
  }

  useEffect(() => { fetchProfile(); }, []);

  async function updateProfile(updates: Partial<UserData>) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) await fetchProfile();
    return res.ok;
  }

  return { profile, loading, updateProfile, refetch: fetchProfile };
}
