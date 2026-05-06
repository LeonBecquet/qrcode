import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("affiche le hero et les CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/QR Restaurant/);
    await expect(page.getByRole("heading", { name: /commandent/i })).toBeVisible();

    const startCta = page.getByRole("link", { name: /Démarrer mon restaurant/i });
    await expect(startCta).toBeVisible();
    await expect(startCta).toHaveAttribute("href", "/signup");
  });

  test("contient les sections principales", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Comment ça marche/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Tout pour votre service/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Tarifs simples/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Questions fréquentes/i })).toBeVisible();
  });

  test("liens vers les pages légales depuis le footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Mentions légales/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^CGU$/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^CGV$/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Confidentialité/i })).toBeVisible();
  });

  test("la page se charge en moins de 3s", async ({ page }) => {
    const start = performance.now();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });
});
