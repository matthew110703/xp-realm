export interface TeleportScores {
  summary: string;
  teleportCityScore: number;
  categories: {
    name: string;
    scoreOutOf10: number;
    color: string;
  }[];
}

export interface TeleportDetails {
  housingCostRange: { min: number; max: number; currency: string };
  costOfLivingItems: { label: string; value: string }[];
}

export interface CountryInfo {
  countryCode: string;
  countryName: string;
  flag: string;
  currency: string;
  timezone: string;
  region: string;
  teleportScores: TeleportScores | null;
  teleportDetails: TeleportDetails | null;
  workPermitNotes: string;
  taxRegistrationNotes: string;
  availablePaymentMethods: string[];
  freelancerTips: string[];
}
