import { expect, test } from "@playwright/test";

test.describe("public site", () => {
  test("hero answers who/what and shows all three CTAs above the fold", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("#top");
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
    for (const name of [/view resume/i, /let's talk/i, /see my work/i]) {
      const cta = hero.getByRole(name.source.includes("resume") ? "link" : "button", { name });
      await expect(cta).toBeInViewport();
    }
    const noHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(noHorizontalScroll).toBe(true);
  });

  test("every resume link opens /resume in a new tab", async ({ page }) => {
    await page.goto("/");
    const links = page.locator('a[href="/resume"]');
    expect(await links.count()).toBeGreaterThan(0);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });

  test("/resume embeds the active PDF with a download button; /resume.pdf redirects to it", async ({ page, request }) => {
    await page.goto("/resume");
    await expect(page.locator("iframe")).toHaveAttribute("src", /\/api\/files\/[a-f0-9]{24}/);
    await expect(page.getByRole("link", { name: /download pdf/i })).toBeVisible();

    const res = await request.get("/resume.pdf");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("application/pdf");
    expect((await res.body()).subarray(0, 5).toString()).toBe("%PDF-");
  });

  test("recruiter mode shows the 30-second summary and toggles back", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) {
      await page.getByRole("button", { name: "Open menu" }).click();
    }
    await page
      .getByRole("switch", { name: /30-sec view/i })
      .first()
      .click();
    const summary = page.locator(".recruiter-view");
    await expect(summary).toBeVisible();
    await expect(summary.getByText(/top skills/i)).toBeVisible();
    await expect(page.locator(".full-view")).toBeHidden();
    await summary.getByRole("button", { name: /see the full portfolio/i }).click();
    await expect(page.locator(".full-view")).toBeVisible();
  });

  test("command palette opens with Ctrl/⌘+K and runs actions", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard shortcut is a desktop feature");
    await page.goto("/");
    // The shortcut hint renders only after hydration, so wait for it first.
    await expect(page.getByRole("button", { name: "Open command palette" })).toBeVisible();
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();
    await page.keyboard.type("toggle theme");
    const wasDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(!wasDark);
  });

  test("contact form validates input before submitting", async ({ page }) => {
    await page.goto("/#contact");
    const form = page.locator("#contact form");
    await form.getByRole("button", { name: /send message/i }).click();
    await expect(form.getByText("Required").first()).toBeVisible();
    await form.getByLabel("Email").fill("not-an-email");
    await form.getByLabel("Email").blur();
    await expect(form.getByText(/valid email/i)).toBeVisible();
  });

  test("terminal easter egg answers commands", async ({ page, isMobile }) => {
    test.skip(isMobile, "covered on desktop");
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Open command palette" })).toBeVisible();
    await page.getByRole("button", { name: "Open terminal" }).click();
    const input = page.getByRole("textbox", { name: "Command" });
    await input.fill("whoami");
    await input.press("Enter");
    await expect(page.getByRole("log")).toContainText("Software Engineer");
  });
});
