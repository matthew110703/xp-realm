"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PersonalInfoStep } from "./steps/personal-info-step";
import { JobPreferencesStep } from "./steps/job-preferences-step";
import { SkillsStep } from "./steps/skills-step";
import { ResumeUploadStep } from "./steps/resume-upload-step";
import type { ParsedResume } from "@/types/profile.types";

interface PersonalForm { name: string; country: string; city: string; portfolioUrl: string }

const STEPS = ["Personal Info", "Job Preferences", "Skills", "Resume"];

export function OnboardingShell() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const personalForm = useForm<PersonalForm>({
    defaultValues: { name: "", country: "", city: "", portfolioUrl: "" },
  });

  const [jobTypes, setJobTypes] = useState(["part-time", "freelance"]);
  const [categories, setCategories] = useState<string[]>([]);
  const [payRangeMin, setPayRangeMin] = useState(0);
  const [payRangeMax, setPayRangeMax] = useState(5000);
  const [currency, setCurrency] = useState("USD");
  const [skills, setSkills] = useState<string[]>([]);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

  function handlePayRange(min: number, max: number) {
    setPayRangeMin(min);
    setPayRangeMax(max);
  }

  function handleParsed(resume: ParsedResume) {
    setParsedResume(resume);
    const merged = Array.from(new Set([...skills, ...resume.skills]));
    setSkills(merged);
  }

  async function complete() {
    setSaving(true);

    const personal = personalForm.getValues();
    const allSkills = parsedResume
      ? Array.from(new Set([...skills, ...parsedResume.skills]))
      : skills;

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: personal.name,
        country: personal.country,
        city: personal.city,
        portfolioUrl: personal.portfolioUrl,
        payRangeMin,
        payRangeMax,
        currency,
        jobTypes,
        categories,
        parsedSkills: allSkills,
      }),
    });

    if (res.ok) {
      await fetch("/api/onboarding/complete", { method: "POST" });
    }

    setSaving(false);

    if (!res.ok) {
      toast.error("Failed to save profile");
      return;
    }

    toast.success("Profile set up! Let's find you some opportunities.");
    router.push("/jobs");
    router.refresh();
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{STEPS[step]}</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <div className="overflow-hidden">
        <div
          className="transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${step * 100}%)`, display: "flex" }}
        >
          {STEPS.map((_, i) => (
            <div key={i} className="min-w-full">
              {i === 0 && <PersonalInfoStep form={personalForm} />}
              {i === 1 && (
                <JobPreferencesStep
                  jobTypes={jobTypes}
                  categories={categories}
                  payRangeMin={payRangeMin}
                  payRangeMax={payRangeMax}
                  currency={currency}
                  onJobTypesChange={setJobTypes}
                  onCategoriesChange={setCategories}
                  onPayRangeChange={handlePayRange}
                  onCurrencyChange={setCurrency}
                />
              )}
              {i === 2 && <SkillsStep skills={skills} onSkillsChange={setSkills} />}
              {i === 3 && <ResumeUploadStep onParsed={handleParsed} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
        ) : (
          <Button onClick={complete} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Finish setup
          </Button>
        )}
      </div>
    </div>
  );
}
