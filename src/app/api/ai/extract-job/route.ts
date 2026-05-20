import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { apiError } from "@/lib/utils";
import { extractJobFromText } from "@/services/scraper/job-extractor";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const { rawText, siteName, siteUrl } = await req.json() as {
    rawText: string;
    siteName: string;
    siteUrl: string;
  };

  if (!rawText || !siteName || !siteUrl) {
    return apiError("rawText, siteName, and siteUrl are required", "VALIDATION_ERROR");
  }

  const job = await extractJobFromText(rawText, siteName, siteUrl);

  return Response.json({ job });
}
