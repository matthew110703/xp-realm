export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  timezone: string[];
  region: string;
  costOfLivingIndex: number | null;
  rentIndex: number | null;
  workPermitNotes: string;
  taxRegistrationNotes: string;
  availablePaymentMethods: string[];
  freelancerTips: string[];
  visaInfo: string;
  cachedAt: string;
}
