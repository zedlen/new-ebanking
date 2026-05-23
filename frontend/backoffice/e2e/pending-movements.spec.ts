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

test("movimientos pendientes — abrir detalle mock", async ({ page }) => {
  await seedSession(page);
  await page.goto("/home/movements");

  await expect(
    page.getByRole("heading", { name: "Aprobar movimientos" }),
  ).toBeVisible();
  await expect(
    page.getByText("Datos de demostración — API pendiente"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Ver" }).first().click();
  await expect(page.getByText("Aprobar movimiento")).toBeVisible();
  await expect(page.getByText("LIVING ROCK DIGITAL")).toBeVisible();
  await expect(page.getByText("GEMTRANSFER")).toBeVisible();
});
