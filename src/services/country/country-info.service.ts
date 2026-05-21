import ky from "ky";
import { prisma } from "@/lib/prisma";
import { callClaude } from "@/lib/claude";
import { RESTCOUNTRIES_API, TELEPORT_API } from "@/constants/api.constants";
import { COUNTRY_INFO_CACHE_DAYS } from "@/constants/app.constants";
import type { CountryInfo, TeleportScores, TeleportDetails } from "@/types/country.types";

interface RestcountriesResult {
  name: { common: string };
  cca2: string;
  flags: { svg: string };
  currencies?: Record<string, { name: string; symbol: string }>;
  timezones?: string[];
  region?: string;
}

interface TeleportUAList {
  _links: { "ua:item": { href: string; name: string }[] };
}

interface TeleportScoresRaw {
  summary: string;
  teleport_city_score: number;
  categories: { color: string; name: string; score_out_of_10: number }[];
}

interface TeleportDetailsRaw {
  categories: {
    label: string;
    data: { label: string; currency_dollar_value?: number; type: string }[];
  }[];
}

function resolveSlug(uaList: TeleportUAList, countryName: string): string | null {
  const words = countryName.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const match = uaList._links["ua:item"].find((ua) => {
    const nameLower = ua.name.toLowerCase();
    return words.some((w) => nameLower.includes(w));
  });
  return match?.href.match(/slug:([^/]+)/)?.[1] ?? null;
}

function parseTeleportScores(raw: TeleportScoresRaw): TeleportScores {
  return {
    summary: raw.summary.replace(/<[^>]+>/g, "").trim(),
    teleportCityScore: Math.round(raw.teleport_city_score * 10) / 10,
    categories: raw.categories.map((c) => ({
      name: c.name,
      scoreOutOf10: Math.round(c.score_out_of_10 * 10) / 10,
      color: c.color,
    })),
  };
}

function parseTeleportDetails(raw: TeleportDetailsRaw): TeleportDetails {
  const housingCat = raw.categories.find((c) => c.label === "Housing");
  const housingValues = (housingCat?.data ?? [])
    .filter((d) => d.type === "currency" && d.currency_dollar_value !== undefined)
    .map((d) => d.currency_dollar_value as number);

  const housingCostRange =
    housingValues.length > 0
      ? { min: Math.min(...housingValues), max: Math.max(...housingValues), currency: "USD" }
      : { min: 0, max: 0, currency: "USD" };

  const costOfLivingItems = raw.categories
    .filter((c) => c.label !== "Housing")
    .slice(0, 4)
    .flatMap((c) =>
      c.data
        .filter((d) => d.type === "currency" && d.currency_dollar_value !== undefined)
        .slice(0, 1)
        .map((d) => ({
          label: d.label,
          value: `$${Math.round(d.currency_dollar_value!).toLocaleString()}`,
        }))
    );

  return { housingCostRange, costOfLivingItems };
}

export async function getCountryInfo(countryCode: string): Promise<CountryInfo | null> {
  const cached = await prisma.countryInfoCache.findUnique({
    where: { countryCode },
  });

  if (cached && new Date() < cached.expiresAt) {
    return cached.data as unknown as CountryInfo;
  }

  try {
    const [countryResult, uaListResult] = await Promise.allSettled([
      ky.get(`${RESTCOUNTRIES_API}/alpha/${countryCode}`).json<RestcountriesResult[]>(),
      ky.get(`${TELEPORT_API}/urban_areas/`, { timeout: 8000 }).json<TeleportUAList>(),
    ]);

    const country = countryResult.status === "fulfilled" ? countryResult.value[0] : null;
    if (!country) return null;

    const currencies = country.currencies ? Object.values(country.currencies) : [];
    const currency = currencies[0]?.name ?? "Unknown";

    let teleportScores: TeleportScores | null = null;
    let teleportDetails: TeleportDetails | null = null;

    if (uaListResult.status === "fulfilled") {
      const slug = resolveSlug(uaListResult.value, country.name.common);

      if (slug) {
        const [scoresResult, detailsResult] = await Promise.allSettled([
          ky.get(`${TELEPORT_API}/urban_areas/slug:${slug}/scores/`, { timeout: 8000 }).json<TeleportScoresRaw>(),
          ky.get(`${TELEPORT_API}/urban_areas/slug:${slug}/details/`, { timeout: 8000 }).json<TeleportDetailsRaw>(),
        ]);

        if (scoresResult.status === "fulfilled") {
          teleportScores = parseTeleportScores(scoresResult.value);
        }
        if (detailsResult.status === "fulfilled") {
          teleportDetails = parseTeleportDetails(detailsResult.value);
        }
      }
    }

    const claudePrompt = `For a remote freelancer or part-time worker based in ${country.name.common} (${countryCode}), provide practical JSON info with these exact keys:
- workPermitNotes: string (do they need a permit to work remotely for foreign companies?)
- taxRegistrationNotes: string (how/where to register as a freelancer for taxes?)
- availablePaymentMethods: string[] (e.g. ["PayPal", "Payoneer", "Wise", "Crypto"])
- freelancerTips: string[] (2-3 practical tips for remote workers in this country)

Return ONLY valid JSON.`;

    const claudeText = await callClaude(claudePrompt, 1024);
    const jsonMatch = claudeText.match(/\{[\s\S]*\}/);
    const claudeData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    const info: CountryInfo = {
      countryCode,
      countryName: country.name.common,
      flag: country.flags?.svg ?? "",
      currency,
      timezone: country.timezones?.[0] ?? "",
      region: country.region ?? "",
      teleportScores,
      teleportDetails,
      workPermitNotes: claudeData.workPermitNotes ?? "",
      taxRegistrationNotes: claudeData.taxRegistrationNotes ?? "",
      availablePaymentMethods: claudeData.availablePaymentMethods ?? [],
      freelancerTips: claudeData.freelancerTips ?? [],
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + COUNTRY_INFO_CACHE_DAYS);

    await prisma.countryInfoCache.upsert({
      where: { countryCode },
      create: { countryCode, data: info as unknown as object, expiresAt },
      update: { data: info as unknown as object, cachedAt: new Date(), expiresAt },
    });

    return info;
  } catch {
    return null;
  }
}
