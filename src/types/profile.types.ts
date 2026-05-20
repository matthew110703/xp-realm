export interface ParsedExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface ParsedEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface ParsedResume {
  skills: string[];
  experience: ParsedExperience[];
  education: ParsedEducation[];
  summary: string;
}

export interface UserProfileData {
  id: string;
  userId: string;
  resumeUrl: string | null;
  resumeKey: string | null;
  parsedSkills: string[];
  parsedExp: ParsedExperience[] | null;
  parsedEdu: ParsedEducation[] | null;
  jobTypes: string[];
  categories: string[];
  bio: string | null;
}

export interface UserData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  country: string | null;
  city: string | null;
  portfolioUrl: string | null;
  payRangeMin: number | null;
  payRangeMax: number | null;
  currency: string;
  onboardingDone: boolean;
  profile: UserProfileData | null;
}
