import { expect, test } from "@playwright/test";

const EMAIL = process.env.ADMIN_EMAIL ?? "";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "";

test.describe.configure({ mode: "serial" });

test.describe("admin security", () => {
  test("/admin redirects to the login page when signed out", async ({ page }) => {
    await page.goto("/admin/projects");
    await expect(page).toHaveURL(/\/admin\/login\?from=%2Fadmin%2Fprojects/);
    await expect(page.getByRole("heading", { name: /admin sign in/i })).toBeVisible();
  });

  test("direct requests that bypass the UI are rejected", async ({ request }) => {
    const upload = await request.post("/api/admin/upload", {
      multipart: { kind: "image", file: { name: "x.png", mimeType: "image/png", buffer: Buffer.from("x") } },
    });
    expect(upload.status()).toBe(401);

    // A forged server-action POST to an admin page never reaches the action.
    const action = await request.post("/admin/projects", {
      headers: { "Next-Action": "0".repeat(42), "Content-Type": "text/plain;charset=UTF-8" },
      data: "[]",
      maxRedirects: 0,
    });
    expect(action.status()).toBe(401);

    // A forged session cookie is rejected too.
    const forged = await request.get("/admin", {
      headers: { Cookie: "admin_session=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.invalid" },
      maxRedirects: 0,
    });
    expect(forged.status()).toBe(307);
  });

  test("wrong credentials show a generic error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill("definitely-wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/^Invalid credentials./)).toBeVisible();
  });
});

test.describe("admin editing", () => {
  test.skip(!EMAIL || !PASSWORD, "ADMIN_EMAIL / ADMIN_PASSWORD not set");

  test("sign in, edit a stat, see it on the public site, then restore it", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.goto("/admin/stats");
    await page.getByRole("button", { name: /edit 3\.86/i }).click();
    const label = page.getByLabel("Label");
    const original = await label.inputValue();
    await label.fill("CGPA (e2e check)");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    await page.goto("/");
    await expect(page.getByText("CGPA (e2e check)")).toBeVisible();

    await page.goto("/admin/stats");
    await page.getByRole("button", { name: /edit 3\.86/i }).click();
    await page.getByLabel("Label").fill(original);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved")).toBeVisible();
  });

  test("repeated wrong passwords get rate limited", async ({ browser }) => {
    const page = await (await browser.newContext()).newPage();
    for (let i = 0; i < 6; i++) {
      await page.goto("/admin/login");
      await page.getByLabel("Email").fill(EMAIL);
      await page.getByLabel("Password").fill(`wrong-${i}`);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page.getByText(/^Invalid credentials/)).toBeVisible();
    }
    await expect(page.getByText(/too many attempts/i)).toBeVisible();
  });
});
