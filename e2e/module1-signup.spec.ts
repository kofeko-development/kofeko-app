import { expect, test, type Page } from "@playwright/test";

/** Intercepts company signup API calls regardless of `NEXT_PUBLIC_API_BASE_URL` host/port. */
async function mockCompanySignupApis(page: Page) {
  await page.route(/\/api\/v1\/auth\/register-company-email-otp\/send\b/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Verification code sent",
        data: { sent: true },
      }),
    });
  });

  await page.route(/\/api\/v1\/auth\/register-company-email-otp\/verify\b/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Email verified",
        data: { emailVerificationToken: "e2e-playwright-mock-token-not-valid-jwt" },
      }),
    });
  });

  await page.route(/\/api\/v1\/auth\/register-company-request\b/, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Company registration submitted successfully",
        data: {
          requestId: "e2e-request-id",
          status: "pending",
          message: "Company registration submitted and pending super admin approval",
        },
      }),
    });
  });
}

async function pickSearchableOption(
  page: Page,
  triggerId: string,
  placeholderPattern: RegExp,
  search: string,
  optionLabel: string,
) {
  await page.locator(`#${triggerId}`).click();
  await page.getByPlaceholder(placeholderPattern).fill(search);
  await page.getByRole("button", { name: optionLabel, exact: true }).click();
}

test.describe("Module 1 signup — smoke (no API mocks)", () => {
  test("signup page shows company registration step 1", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Company registration" })).toBeVisible();
    await expect(page.getByLabel("Company admin email")).toBeVisible();
  });

  test("Verify stays disabled when admin email shape is invalid", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Company admin email").fill("foo@bar");
    await expect(page.getByRole("button", { name: "Verify", exact: true })).toBeDisabled();
  });
});

test.describe("Module 1 signup — browser flow (mocked API)", () => {
  test.beforeEach(async ({ page }) => {
    await mockCompanySignupApis(page);
  });

  test("completes step 1–2 and lands on signup success", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/signup");

    await page.getByLabel("Company admin email").fill("browser-e2e@example.test");
    await page.getByRole("button", { name: "Verify", exact: true }).click();
    await expect(page.getByLabel("Email code")).toBeVisible({ timeout: 15_000 });

    await page.getByLabel("Email code").fill("123456");
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    await expect(page.getByText("This email is verified.")).toBeVisible({ timeout: 15_000 });

    await page.locator("#admin-password").fill("Playwright1");
    await page.locator("#admin-password-confirm").fill("Playwright1");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByLabel("Company Name")).toBeVisible({ timeout: 20_000 });

    await page.getByLabel("Company Name").fill("E2E Browser Co");
    await page.getByLabel("Industry").fill("Technology");

    await pickSearchableOption(page, "country", /Search country/i, "United States", "United States");
    await pickSearchableOption(page, "state", /Search state/i, "California", "California");
    await pickSearchableOption(page, "city", /Search city/i, "San Francisco", "San Francisco");

    await page.getByLabel("Company Address (Full Address)").fill("100 Market Street");
    await page.locator("#zip-code").fill("94105");

    await page.locator("#company-size").selectOption("11-50");
    await page.locator("#founded-year").fill("2020");

    await page.locator("#phone-national").fill("4155552671");

    await page.getByLabel("Company Website").fill("https://e2e-browser.example.test");
    await page.getByLabel("Company Logo URL").fill("https://e2e-browser.example.test/logo.png");

    await page
      .getByLabel("Short Company Description")
      .fill("Playwright browser automation test for Module 1 company signup flow.");

    await page.getByRole("checkbox", { name: /terms and conditions/i }).check();

    await page.getByRole("button", { name: /Submit Company Registration/i }).click();

    await expect(page).toHaveURL(/\/signup-success/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Application Received!" })).toBeVisible();
  });
});
