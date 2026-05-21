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
import { TELEGRAM_BOT_USERNAME } from "@/constants/app.constants";

interface Props {
  onConnected: () => void;
}

export function ConnectTelegramBot({ onConnected }: Props) {
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    if (!chatId.trim()) return;
    setLoading(true);

    const res = await fetch("/api/telegram/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chatId.trim() }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Telegram connected! Check your Telegram for a confirmation message.");
      setOpen(false);
      setChatId("");
      onConnected();
    } else {
      const data = await res.json() as { error?: string };
      toast.error(data.error ?? "Failed to connect Telegram");
    }
  }

  const botUsername = TELEGRAM_BOT_USERNAME || "XPRealmBot";

  return (
    <>
      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setOpen(true)}>
        Connect
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Telegram Bot</DialogTitle>
            <DialogDescription>
              Follow these steps to receive job drafts in your Telegram.
            </DialogDescription>
          </DialogHeader>

          <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
            <li>
              Open Telegram and search for{" "}
              <a
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono"
              >
                @{botUsername}
              </a>
            </li>
            <li>Press <strong>Start</strong> — the bot will reply with your chat ID</li>
            <li>Copy the numeric chat ID and paste it below</li>
          </ol>

          <div className="space-y-2">
            <Label htmlFor="chatId">Your Telegram Chat ID</Label>
            <Input
              id="chatId"
              placeholder="e.g. 123456789"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleConnect} disabled={loading || !chatId.trim()}>
              {loading ? "Connecting…" : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
