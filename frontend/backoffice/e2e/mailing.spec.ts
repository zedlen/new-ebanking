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

const templateId = "tpl-e2e";

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

test("mailing — listar plantilla y enviar correo", async ({ page }) => {
  await seedSession(page);

  await page.route("**/mailing/templates", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: templateId,
              name: "Bienvenida E2E",
              status: "published",
              published_at: "2026-01-01",
              created_at: "2026-01-01",
              updated_at: "2026-01-02",
              alias: "welcome-e2e",
            },
          ],
          has_more: false,
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.route(`**/mailing/templates/${templateId}`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: templateId,
            alias: "welcome-e2e",
            name: "Bienvenida E2E",
            created_at: "2026-01-01",
            updated_at: "2026-01-02",
            status: "published",
            published_at: "2026-01-01",
            from: "Zeus <noreply@zeus.test>",
            subject: "Hola {{{user_name}}}",
            reply_to: "",
            html: "<p>Hola {{{user_name}}}</p>",
            text: "Hola {{{user_name}}}",
            variables: [
              {
                id: "var-1",
                key: "user_name",
                type: "string",
                fallback_value: "Usuario",
              },
            ],
            has_unpublished_versions: false,
          },
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.route("**/mailing/send", async (route) => {
    await route.fulfill({ status: 200, body: "{}" });
  });

  await page.goto("/home/mailing");
  await expect(
    page.getByRole("heading", { name: "Plantillas de correo" }),
  ).toBeVisible();
  await expect(page.getByText("Bienvenida E2E")).toBeVisible();

  await page.getByRole("button", { name: "Enviar" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Enviar correo con plantilla" }),
  ).toBeVisible();

  await page.getByLabel("Para").fill("destino@test.com");
  await page.getByLabel("Valor").fill("Luis E2E");
  await page.getByRole("button", { name: "Enviar" }).last().click();

  await expect(page.getByText("Correo enviado correctamente")).toBeVisible();
});

test("mailing — crear plantilla muestra el editor", async ({ page }) => {
  await seedSession(page);

  await page.route("**/mailing/templates", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], has_more: false }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/home/mailing");
  await page.getByRole("button", { name: "Crear plantilla" }).click();
  await expect(page.getByText("Editor de plantilla")).toBeVisible();
  await expect(page.getByLabel("Nombre")).toBeVisible();
});
