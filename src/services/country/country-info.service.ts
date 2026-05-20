import ky from "ky";
import { prisma } from "@/lib/prisma";
import { callClaude } from "@/lib/claude";
import { RESTCOUNTRIES_API, NUMBEO_API } from "@/constants/api.constants";
import { COUNTRY_INFO_CACHE_DAYS } from "@/constants/app.constants";
import type { CountryInfo } from "@/types/country.types";

interface RestcountriesResult {
  name: { common: string };
  cca2: string;
  flags: { svg: string };
  currencies?: Record<string, { name: string; symbol: string }>;
  timezones?: string[];
  region?: string;
}

interface NumbeoResponse {
  cost_of_living_index?: number;
  rent_index?: number;
}

export async function getCountryInfo(countryCode: string): Promise<CountryInfo | null> {
  const cached = await prisma.countryInfoCache.findUnique({
    where: { countryCode },
  });

  if (cached && new Date() < cached.expiresAt) {
    return cached.data as unknown as CountryInfo;
  }

  try {
    const [countryData, numbeoData] = await Promise.allSettled([
      ky.get(`${RESTCOUNTRIES_API}/alpha/${countryCode}`).json<RestcountriesResult[]>(),
      ky.get(`${NUMBEO_API}/country_prices`, {
        searchParams: {
          api_key: process.env.NUMBEO_API_KEY ?? "",
          country: countryCode,
        },
        timeout: 5000,
      }).json<NumbeoResponse>(),
    ]);

    const country = countryData.status === "fulfilled" ? countryData.value[0] : null;
    if (!country) return null;

    const currencies = country.currencies ? Object.values(country.currencies) : [];
    const currency = currencies[0]?.name ?? "Unknown";
    const currencySymbol = currencies[0]?.symbol ?? "";
    const costOfLivingIndex = numbeoData.status === "fulfilled" ? numbeoData.value.cost_of_living_index ?? null : null;
    const rentIndex = numbeoData.status === "fulfilled" ? numbeoData.value.rent_index ?? null : null;

    const claudePrompt = `For a remote freelancer or part-time worker based in ${country.name.common} (${countryCode}), provide practical JSON info with these exact keys:
- workPermitNotes: string (do they need a permit to work remotely for foreign companies?)
- taxRegistrationNotes: string (how/where to register as a freelancer for taxes?)
- availablePaymentMethods: string[] (e.g. ["PayPal", "Payoneer", "Wise", "Crypto"])
- freelancerTips: string[] (2-3 practical tips for remote workers in this country)
- visaInfo: string (any relevant digital nomad or freelance visa info)

Return ONLY valid JSON.`;

    const claudeText = await callClaude(claudePrompt, 1024);
    const jsonMatch = claudeText.match(/\{[\s\S]*\}/);
    const claudeData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    const info: CountryInfo = {
      code: countryCode,
      name: country.name.common,
      flag: country.flags?.svg ?? "",
      currency,
      currencySymbol,
      timezone: country.timezones ?? [],
      region: country.region ?? "",
      costOfLivingIndex,
      rentIndex,
      workPermitNotes: claudeData.workPermitNotes ?? "",
      taxRegistrationNotes: claudeData.taxRegistrationNotes ?? "",
      availablePaymentMethods: claudeData.availablePaymentMethods ?? [],
      freelancerTips: claudeData.freelancerTips ?? [],
      visaInfo: claudeData.visaInfo ?? "",
      cachedAt: new Date().toISOString(),
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + COUNTRY_INFO_CACHE_DAYS);

    await prisma.countryInfoCache.upsert({
      where: { countryCode },
      create: { countryCode, data: info as object, expiresAt },
      update: { data: info as object, cachedAt: new Date(), expiresAt },
    });

    return info;
  } catch {
    return null;
  }
}
