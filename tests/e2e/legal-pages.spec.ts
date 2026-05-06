import { expect, test } from "@playwright/test";

const LEGAL_PAGES = [
  { path: "/legal/mentions-legales", title: /Mentions légales/i },
  { path: "/legal/cgu", title: /Conditions générales d.utilisation/i },
  { path: "/legal/cgv", title: /Conditions générales de vente/i },
  { path: "/legal/confidentialite", title: /Politique de confidentialité/i },
  { path: "/legal/cookies", title: /Politique cookies/i },
];

test.describe("Pages légales", () => {
  for (const { path, title } of LEGAL_PAGES) {
    test(`${path} se charge`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
    });
  }

  test("le sitemap.xml est accessible", async ({ page }) => {
    const response = await page.request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/legal/mentions-legales");
  });

  test("robots.txt expose le sitemap", async ({ page }) => {
    const response = await page.request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Sitemap:");
    expect(body).toContain("Disallow: /api/");
    expect(body).toContain("Disallow: /dashboard/");
  });
});
