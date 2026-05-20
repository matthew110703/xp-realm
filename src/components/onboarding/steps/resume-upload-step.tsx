"use client";

import { useCallback, useState } from "react";
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ParsedResume } from "@/types/profile.types";

interface Props {
  onParsed: (resume: ParsedResume, url: string) => void;
}

export function ResumeUploadStep({ onParsed }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);

  const upload = useCallback(async (file: File) => {
    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      toast.error("Only PDF and DOCX files allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }

    setUploading(true);
    const form = new FormData();
    form.append("resume", file);

    const res = await fetch("/api/profile/resume", { method: "POST", body: form });
    setUploading(false);

    if (!res.ok) {
      toast.error("Upload failed — please try again");
      return;
    }

    const data = await res.json() as { parsed: ParsedResume; resumeUrl: string };
    setParsed(data.parsed);
    onParsed(data.parsed, data.resumeUrl);
    toast.success("Resume parsed successfully!");
  }, [onParsed]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-heading font-semibold">Upload your resume</h2>
        <p className="text-sm text-muted-foreground mt-1">
          We&apos;ll extract your skills and experience automatically (optional)
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) upload(file);
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Parsing with AI...</p>
          </div>
        ) : parsed ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium">Resume parsed!</p>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              Drag & drop your PDF or DOCX here
            </p>
            <label htmlFor="resume-file" className={buttonVariants({ variant: "outline", size: "sm" }) + " cursor-pointer"}>
              Browse file
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx"
              className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
            />
          </>
        )}
      </div>

      {parsed && (
        <div className="space-y-3 rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-medium">Extracted skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {parsed.skills.slice(0, 20).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
            ))}
          </div>
          {parsed.experience.length > 0 && (
            <>
              <h3 className="text-sm font-medium pt-1">Experience ({parsed.experience.length} roles)</h3>
              <div className="space-y-1">
                {parsed.experience.slice(0, 3).map((e, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    {e.title} @ {e.company} — {e.duration}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
