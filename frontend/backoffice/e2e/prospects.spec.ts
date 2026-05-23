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

test("aprobar prospecto — ver detalle y aprobar", async ({ page }) => {
  const prospectId = "prospect-e2e";

  await seedSession(page);

  await page.route("**/onboardings?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        total: 1,
        data: [
          {
            uuid: prospectId,
            company_name: "Empresa E2E",
            email: "e2e@test.com",
            rfc: "E2E010101ABC",
            status: "pending",
            requested_kyc: false,
            documents: [
              {
                uuid: "doc-1",
                type: "Acta",
                description: "Acta constitutiva",
                originalName: "acta.pdf",
                fileUrl: "https://example.com/acta.pdf",
                status: "approved",
              },
            ],
          },
        ],
      }),
    });
  });

  await page.route(`**/onboardings/${prospectId}`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          uuid: prospectId,
          company_name: "Empresa E2E",
          email: "e2e@test.com",
          rfc: "E2E010101ABC",
          status: "pending",
          requested_kyc: false,
          documents: [
            {
              uuid: "doc-1",
              type: "Acta",
              description: "Acta constitutiva",
              originalName: "acta.pdf",
              fileUrl: "https://example.com/acta.pdf",
              status: "approved",
            },
          ],
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.route(`**/onboardings/${prospectId}/approve`, async (route) => {
    await route.fulfill({ status: 200, body: "{}" });
  });

  await page.goto("/home/prospects");
  await expect(
    page.getByRole("heading", { name: "Aprobar prospectos" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Ver detalle" }).click();
  await expect(page.getByText("Empresa E2E")).toBeVisible();

  await page.getByRole("button", { name: "Aprobar" }).click();
  await expect(page.getByText("Prospecto aprobado")).toBeVisible();
});
