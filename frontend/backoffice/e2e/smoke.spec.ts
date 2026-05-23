import { test, expect } from "@playwright/test";

test("muestra la pantalla de inicio de sesión", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Backoffice" })).toBeVisible();
  await expect(page.getByLabel("Usuario")).toBeVisible();
  await expect(page.getByLabel("Contraseña")).toBeVisible();
});

test("navega a recuperar contraseña", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Olvidé mi contraseña" }).click();
  await expect(
    page.getByRole("heading", { name: "Recuperar contraseña" }),
  ).toBeVisible();
});
