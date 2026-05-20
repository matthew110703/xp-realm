import * as cheerio from "cheerio";
import ky from "ky";

export async function scrapeStaticPage(url: string): Promise<string> {
  const html = await ky.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; XPRealm/1.0; +https://xprealm.app)",
    },
  }).text();

  const $ = cheerio.load(html);

  $("script, style, nav, footer, header, aside, iframe, img, svg").remove();
  $("[class*='cookie'], [class*='banner'], [id*='cookie'], [id*='popup']").remove();

  const mainText = $("main, article, [role='main'], .job-listing, .jobs-list, body")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000);

  return mainText;
}
