import * as cheerio from "cheerio";

const HN_BASE = "https://news.ycombinator.com";

export async function authenticateHN(username: string, password: string): Promise<string | null> {
  try {
    const body = new URLSearchParams({
      acct: username,
      pw: password,
      goto: "news",
    });

    const res = await fetch(`${HN_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });

    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) return null;

    const userCookieMatch = setCookie.match(/user=[^;]+/);
    return userCookieMatch ? userCookieMatch[0] : null;
  } catch (err) {
    console.error("[hn-commenter] Authentication failed:", err);
    return null;
  }
}

export async function postHNComment(
  parentId: string,
  text: string,
  sessionCookie: string
): Promise<"ok" | "expired" | "failed"> {
  try {
    const itemRes = await fetch(`${HN_BASE}/item?id=${parentId}`, {
      headers: { Cookie: sessionCookie },
      signal: AbortSignal.timeout(10000),
    });

    // Detect session expiry — HN redirects to login
    const finalUrl = itemRes.url;
    if (finalUrl.includes("/login")) return "expired";

    const html = await itemRes.text();
    const $ = cheerio.load(html);

    const hmac = $("input[name='hmac']").val();
    if (!hmac || typeof hmac !== "string") {
      console.error("[hn-commenter] HMAC not found in item page — likely not logged in");
      return "failed";
    }

    const commentBody = new URLSearchParams({
      parent: parentId,
      hmac,
      text,
      goto: `item?id=${parentId}`,
    });

    const commentRes = await fetch(`${HN_BASE}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: sessionCookie,
      },
      body: commentBody.toString(),
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });

    if (commentRes.status === 200 || commentRes.status === 302) return "ok";
    console.error("[hn-commenter] Unexpected status:", commentRes.status);
    return "failed";
  } catch (err) {
    console.error("[hn-commenter] postComment failed:", err);
    return "failed";
  }
}
