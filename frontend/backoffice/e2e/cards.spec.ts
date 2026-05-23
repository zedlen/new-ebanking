import { test, expect } from "@playwright/test";
import {
  SESSION_CUSTOMER_KEY,
  SESSION_PROFILE_KEY,
  SESSION_TOKEN_KEY,
} from "../src/lib/constants";

const mockProfile = {
  customer_id: "cust-1",
  name: "Admin",
  email: "admin@test.com",
};

async function seedSession(page: import("@playwright/test").Page) {
  await page.addInitScript(
    ({ tokenKey, customerKey, profileKey, token, customerId, profile }) => {
      sessionStorage.setItem(tokenKey, token);
      sessionStorage.setItem(customerKey, customerId);
      sessionStorage.setItem(profileKey, JSON.stringify(profile));
    },
    {
      tokenKey: SESSION_TOKEN_KEY,
      customerKey: SESSION_CUSTOMER_KEY,
      profileKey: SESSION_PROFILE_KEY,
      token: "test-token",
      customerId: mockProfile.customer_id,
      profile: mockProfile,
    },
  );
}

test("vincular tarjeta — happy path con OTP mockeado", async ({ page }) => {
  const partnerId = "partner-e2e";
  const customerId = "customer-e2e";

  await seedSession(page);

  await page.route("**/auth/generate-otp-code/link_card", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ code: 200 }),
    });
  });

  await page.route(
    `**/partners/${partnerId}/customers/${customerId}/accounts*`,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          total: 1,
          data: [{ id: "acc-1", external_id: "EXT-001" }],
        }),
      });
    },
  );

  await page.route(
    `**/partners/${partnerId}/customers/${customerId}/cards`,
    async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ code: 200 }),
        });
        return;
      }
      await route.continue();
    },
  );

  await page.goto(`/home/partners/${partnerId}/${customerId}/cards/link`);

  await expect(
    page.getByRole("heading", { name: "Vinculación de tarjeta" }),
  ).toBeVisible();

  await page.getByLabel("Ingresa los 16 dígitos de tu tarjeta").fill("4111111111111111");
  await page.getByRole("button", { name: "Generar código" }).click();
  await expect(
    page.getByText("Hemos enviado el código generado a tu email"),
  ).toBeVisible();

  const otpInputs = page.getByRole("textbox", { name: /Dígito/ });
  for (let i = 1; i <= 6; i++) {
    await otpInputs.nth(i - 1).fill(String(i));
  }

  await page.getByRole("button", { name: "Vincular" }).click();
  await expect(page.getByText("Tarjeta vinculada correctamente")).toBeVisible();
});
