import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/", "/marketplace", "/marketplace/solutions", "/marketplace/government", "/marketplace/providers", "/marketplace/submission-guide",
  "/marketplace/sbir-sttr", "/marketplace/prototype-transition",
  "/opportunities", "/opportunities/solutions-marketplace-collection", "/opportunities/special-topics", "/opportunities/shopping-notices", "/opportunities/archive",
  "/acquisition", "/acquisition/vehicles", "/acquisition/vehicles/test-and-evaluation", "/acquisition/vehicles/draid", "/acquisition/guides",
  "/ai-tools", "/ai-tools/market-research-assistant", "/ai-tools/prompt-library",
  "/resources", "/resources/videos", "/resources/exemplars", "/resources/faqs", "/resources/events", "/resources/news",
  "/about", "/about/impact", "/about/awarded-solutions", "/about/contact",
];

for (const route of ROUTES) {
  test(`renders ${route} without errors, overflow or a11y violations`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("Failed to load resource")) errors.push(m.text()); });
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main#main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "no horizontal page scroll").toBeLessThanOrEqual(0);
    // Stronger check: no visible element extends past the viewport unless an ancestor scrolls/clips it.
    const offenders = await page.evaluate(() => {
      const clipped = (el: Element | null): boolean => {
        for (let p = el?.parentElement; p && p !== document.body; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o !== "visible") return true;
        }
        return false;
      };
      return [...document.querySelectorAll("main *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.right > window.innerWidth + 1 && !clipped(el) && getComputedStyle(el).position !== "fixed";
        })
        .slice(0, 3)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`);
    });
    expect(offenders, "elements overflowing the viewport").toEqual([]);
    // Reveal animations finish before scanning so contrast is measured on final state.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("unknown route returns branded 404", async ({ page }) => {
  const res = await page.goto("/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("pathway");
});

test("legacy Wix URLs redirect permanently", async ({ request }) => {
  for (const [from, to] of [["/faqs", "/resources/faqs"], ["/solutions-marketplace", "/marketplace"], ["/cdao-vehicles", "/acquisition/vehicles"]]) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe(to);
  }
});

test("security headers are present", async ({ request }) => {
  const h = (await request.get("/")).headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-powered-by"]).toBeUndefined();
});

test.describe("desktop navigation", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");
  test("mega menu opens with keyboard and closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle"); // wait for hydration
    const trigger = page.getByRole("button", { name: "Marketplace", exact: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: /Browse Awardables/ }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });
});

test.describe("mobile navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");
  test("menu dialog opens, navigates and closes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await dialog.getByText("Opportunities", { exact: true }).click();
    await dialog.getByRole("link", { name: "Special Topics" }).click();
    await expect(page).toHaveURL(/\/opportunities\/special-topics$/);
    await expect(dialog).toBeHidden();
  });
});

test("solutions filters sync to the URL and survive reload", async ({ page }) => {
  await page.goto("/marketplace/solutions");
  await page.getByLabel("Search solutions").fill("imagery");
  await expect(page).toHaveURL(/q=imagery/);
  const status = page.getByRole("status");
  await expect(status).toContainText(/of 24/);
  await page.reload();
  await expect(page.getByLabel("Search solutions")).toHaveValue("imagery");
  await page.getByLabel("Search solutions").fill("zzzz-no-match");
  await expect(page.getByText("No solutions match those filters")).toBeVisible();
});

test("opportunity status filter and archive", async ({ page }) => {
  await page.goto("/opportunities?status=closed");
  await expect(page.getByRole("radio", { name: /Closed/ })).toHaveAttribute("aria-checked", "true");
  const cards = page.locator("article");
  await expect(cards.first()).toContainText("Closed");
});

test("prompt library copies a prompt", async ({ page, context, browserName, isMobile }) => {
  test.skip(browserName !== "chromium");
  if (!isMobile) await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/ai-tools/prompt-library");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /Copy prompt: Write an outcome-based problem statement/ }).click();
  await expect(page.getByRole("button", { name: "Copied" }).first()).toBeVisible();
  // Headless mobile emulation stalls on clipboard reads; verify contents on desktop only.
  if (isMobile) return;
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("outcome-based problem statement");
});

test("FAQ deep link opens the answer", async ({ page }) => {
  await page.goto("/resources/faqs#video-length");
  await expect(page.locator("details#video-length")).toHaveAttribute("open", "");
});
