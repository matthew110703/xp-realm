"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  postId: string;
  postTitle: string;
  initialComment: string;
  onClose: () => void;
}

export function CommentPreviewModal({ open, postId, postTitle, initialComment, onClose }: Props) {
  const [comment, setComment] = useState(initialComment);
  const [posting, setPosting] = useState(false);

  async function handlePost() {
    setPosting(true);
    const res = await fetch("/api/reddit/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, comment }),
    });
    setPosting(false);

    if (res.ok) {
      toast.success("Comment posted to Reddit!");
      onClose();
    } else {
      const err = await res.json() as { error: string };
      toast.error(err.error ?? "Failed to post comment");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-heading">Post comment</DialogTitle>
          <p className="text-xs text-muted-foreground truncate">{postTitle}</p>
        </DialogHeader>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={6}
          className="resize-none text-sm"
          placeholder="Your comment..."
        />
        <p className="text-xs text-muted-foreground">{comment.length} characters</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePost} disabled={posting || !comment.trim()}>
            {posting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            Post to Reddit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
