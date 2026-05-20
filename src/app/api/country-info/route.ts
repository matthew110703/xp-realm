import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { apiError } from "@/lib/utils";
import { getCountryInfo } from "@/services/country/country-info.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", "UNAUTHORIZED", 401);

  const code = req.nextUrl.searchParams.get("code");
  if (!code) return apiError("Country code required", "VALIDATION_ERROR");

  const info = await getCountryInfo(code.toUpperCase());
  if (!info) return apiError("Country not found", "NOT_FOUND", 404);

  return Response.json({ info });
}
