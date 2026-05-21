"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  hnId: string;
  postText: string;
  onClose: () => void;
}

export function HNCommentModal({ open, hnId, postText, onClose }: Props) {
  const [comment, setComment] = useState("");
  const [generating, setGenerating] = useState(false);
  const [posting, setPosting] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    const res = await fetch("/api/ai/generate-hn-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postText, hnId }),
    });
    const data = await res.json() as { comment?: string };
    setComment(data.comment ?? "");
    setGenerating(false);
  }

  async function handlePost() {
    if (!comment.trim()) return;
    setPosting(true);

    const res = await fetch("/api/hn/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: hnId, text: comment }),
    });

    setPosting(false);

    if (res.ok) {
      toast.success("Comment posted to Hacker News!");
      onClose();
    } else {
      const data = await res.json() as { error?: string };
      toast.error(data.error ?? "Failed to post comment");
    }
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setComment("");
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Comment on HN</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {generating ? "Generating…" : "Generate with AI"}
            </Button>
          </div>

          <Textarea
            placeholder="Write your comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={6}
            className="resize-none text-sm"
          />

          <p className="text-xs text-muted-foreground text-right">
            {comment.length} characters
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePost} disabled={posting || !comment.trim()}>
            {posting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Post Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
