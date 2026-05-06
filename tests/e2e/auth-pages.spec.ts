import { expect, test } from "@playwright/test";

test.describe("Pages d'authentification", () => {
  test("/signup affiche le formulaire de création de compte", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /Créer un compte/i })).toBeVisible();
    await expect(page.getByLabel("Nom")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
    await expect(page.getByRole("button", { name: /Créer mon compte/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Se connecter/i })).toBeVisible();
  });

  test("/signin affiche le formulaire de connexion", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: /Connexion/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
    await expect(page.getByRole("button", { name: /Se connecter/i })).toBeVisible();
  });

  test("/dashboard sans session redirige vers /signin", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/signin/);
  });

  test("/onboarding sans session redirige vers /signin", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/signin/);
  });
});
