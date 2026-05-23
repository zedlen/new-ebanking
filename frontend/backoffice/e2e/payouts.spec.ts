import { test, expect } from "@playwright/test";
import path from "node:path";
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

test("cargar archivo de liquidación — happy path mock", async ({ page }) => {
  await seedSession(page);

  await page.route("**/cards/payout", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          dayGrouping: {
            "2024-09-09": {
              total: "100",
              records: [
                {
                  ts: "2024-09-09T18:16:02Z",
                  "ts-cst": "2024-09-09T12:16:02Z",
                  request_headers: { Uuid: "uuid-1" },
                  request: {
                    body: {
                      processing: { type: "PURCHASE" },
                      values: { billing_value: "100" },
                      establishment: "Tienda Test",
                    },
                  },
                  response: { body: { response: "APPROVED" } },
                },
              ],
            },
          },
          ignoredRecords: [],
          total: "100",
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/home/payouts");
  await expect(
    page.getByRole("heading", { name: "Archivos de liquidación" }),
  ).toBeVisible();

  const fixture = path.join(process.cwd(), "e2e/fixtures/payout-sample.csv");
  await page.locator('input[type="file"]').setInputFiles(fixture);

  await expect(page.getByText("Archivo procesado correctamente")).toBeVisible();
  await expect(page.getByText("2024-09-09")).toBeVisible();
  await expect(page.getByText("Total procesado:")).toBeVisible();
});
