"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, Upload, LogOut, Trash2, Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/profile/profile-form";
import { ResumeUploadStep } from "@/components/onboarding/steps/resume-upload-step";
import { useProfile } from "@/hooks/use-profile";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import type { ParsedResume } from "@/types/profile.types";

export default function SettingsPage() {
  const { profile, loading, refetch } = useProfile();
  const { subscribed, toggle: togglePush } = usePushSubscription();
  const [deletingAccount, setDeletingAccount] = useState(false);

  function handleResumeParsed(resume: ParsedResume) {
    toast.success(`Resume parsed — ${resume.skills.length} skills extracted`);
    refetch();
  }

  async function handleDeleteAccount() {
    if (!confirm("This will permanently delete your account and all data. This cannot be undone. Continue?")) return;
    setDeletingAccount(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    setDeletingAccount(false);
    if (res.ok) {
      signOut({ callbackUrl: "/login" });
    } else {
      toast.error("Failed to delete account");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-10">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-muted">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="danger" className="text-destructive">Danger</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Personal information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm user={profile} onSaved={refetch} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Resume</CardTitle>
              <CardDescription>
                {profile.profile?.resumeUrl
                  ? "Your resume is on file. Upload a new one to replace it."
                  : "Upload your resume to auto-fill your skills and experience."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.profile?.resumeUrl && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-md bg-muted text-sm">
                  <Upload className="h-4 w-4 text-primary" />
                  <a href={profile.profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                    View current resume
                  </a>
                </div>
              )}
              <ResumeUploadStep onParsed={handleResumeParsed} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Push notifications</CardTitle>
              <CardDescription>Get notified when new jobs are found on Reddit</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className={`h-5 w-5 ${subscribed ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium">{subscribed ? "Enabled" : "Disabled"}</p>
                  <p className="text-xs text-muted-foreground">Daily digest at 9AM</p>
                </div>
              </div>
              <Button variant={subscribed ? "outline" : "default"} size="sm" onClick={togglePush}>
                {subscribed ? "Disable" : "Enable"} notifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Connected accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Reddit</span>
                  <Badge variant="secondary" className="text-xs">OAuth</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Manage in Social tab</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-4">
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
              <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sign out</p>
                  <p className="text-xs text-muted-foreground">End your current session</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Delete account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete all your data</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                >
                  {deletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
