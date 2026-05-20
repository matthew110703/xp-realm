"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Props {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export function SkillsStep({ skills, onSkillsChange }: Props) {
  const [input, setInput] = useState("");

  function addSkill() {
    const trimmed = input.trim();
    if (!trimmed || skills.includes(trimmed)) {
      setInput("");
      return;
    }
    onSkillsChange([...skills, trimmed]);
    setInput("");
  }

  function removeSkill(skill: string) {
    onSkillsChange(skills.filter((s) => s !== skill));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-heading font-semibold">Your skills</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add your skills — they&apos;ll be merged with your resume skills later
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="skill-input">Add a skill</Label>
        <div className="flex gap-2">
          <Input
            id="skill-input"
            placeholder="React, TypeScript, Figma..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={addSkill}
          />
        </div>
        <p className="text-xs text-muted-foreground">Press Enter or comma to add</p>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 pr-1">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 hover:text-destructive transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
