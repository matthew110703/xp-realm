export async function scrapeDynamicPage(url: string): Promise<string> {
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForSelector("body", { timeout: 5000 });

    const text = await page.evaluate(() => {
      const selectors = ["main", "article", "[role='main']", "body"];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el.textContent?.replace(/\s+/g, " ").trim() ?? "";
      }
      return document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
    });

    return text.slice(0, 12000);
  } finally {
    await browser.close();
  }
}
