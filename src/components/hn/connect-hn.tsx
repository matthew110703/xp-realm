"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  onConnected: () => void;
}

export function ConnectHN({ onConnected }: Props) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    if (!username.trim() || !password) return;
    setLoading(true);

    const res = await fetch("/api/hn/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Hacker News account connected!");
      setOpen(false);
      setUsername("");
      setPassword("");
      onConnected();
    } else {
      const data = await res.json() as { error?: string };
      toast.error(data.error ?? "Failed to connect HN account");
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setOpen(true)}>
        Connect
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Hacker News Account</DialogTitle>
            <DialogDescription>
              Enter your HN credentials to enable posting comments on job threads.
            </DialogDescription>
          </DialogHeader>

          <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
            Your password is used only to obtain a session cookie, which is encrypted before storage.
            It is never stored in plaintext.
          </p>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="hn-username">HN Username</Label>
              <Input
                id="hn-username"
                placeholder="your_hn_handle"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hn-password">Password</Label>
              <Input
                id="hn-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                autoComplete="current-password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleConnect} disabled={loading || !username.trim() || !password}>
              {loading ? "Connecting…" : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
