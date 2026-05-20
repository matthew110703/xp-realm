export const JOB_TYPES = [
  { value: "part-time", label: "Part-time", priority: 1 },
  { value: "freelance", label: "Freelance", priority: 2 },
  { value: "contract", label: "Contract", priority: 3 },
  { value: "casual", label: "Casual", priority: 4 },
  { value: "gig", label: "Gig / One-off", priority: 5 },
  { value: "full-time", label: "Full-time", priority: 6 },
  { value: "internship", label: "Internship", priority: 7 },
] as const;

export type JobTypeValue = (typeof JOB_TYPES)[number]["value"];

export const REDDIT_JOB_SUBREDDITS = [
  "forhire",
  "freelance",
  "remotework",
  "WorkOnline",
  "jobbit",
  "slavelabour",
  "HireaWriter",
  "web_design",
  "learnprogramming",
] as const;

export const JOB_CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Writing",
  "Data",
  "Customer Support",
  "Finance",
  "DevOps",
  "Mobile",
  "AI/ML",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];
