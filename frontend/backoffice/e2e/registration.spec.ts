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

test("alta de cliente — persona física (happy path)", async ({ page }) => {
  const partnerId = "partner-e2e";

  await seedSession(page);

  await page.route(`**/partners/${partnerId}/customers`, async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "new-customer" }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto(`/home/register/${partnerId}`);

  await expect(page.getByRole("heading", { name: "Alta de Cliente" })).toBeVisible();
  await page.getByRole("button", { name: "Persona Física" }).click();

  await page.getByLabel("Calle").fill("Insurgentes 100");
  await page.getByLabel("Colonia").fill("Roma Norte");
  await page.getByLabel("Distrito").fill("Cuauhtémoc");
  await page.getByLabel("Número Exterior").fill("100");
  await page.getByLabel("Código Postal").fill("06700");

  await page.getByText("Datos personales").click();
  await page.getByLabel("Nombre(s)").fill("Ana");
  await page.getByLabel("Apellido Paterno").fill("Torres");
  await page.getByLabel("Apellido Materno").fill("Ruiz");
  await page.getByLabel("Email").fill("ana.torres@test.com");
  await page.getByLabel("Teléfono").fill("5511112233");
  await page.getByLabel("RFC").fill("TORA900101ABC");

  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.getByText("Cambios guardados exitosamente")).toBeVisible();
});
