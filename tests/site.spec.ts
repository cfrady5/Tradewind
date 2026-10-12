import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/", "/marketplace", "/marketplace/awardable-companies", "/marketplace/awardees", "/marketplace/government", "/marketplace/providers",
  "/marketplace/submission-guide", "/marketplace/videos", "/marketplace/exemplars", "/marketplace/faqs", "/marketplace/sbir-sttr", "/marketplace/prototype-transition",
  "/opportunities", "/opportunities/solutions-marketplace-collection", "/opportunities/special-topics", "/opportunities/shopping-notices", "/opportunities/archive", "/opportunities/swarm-forge",
  "/contract-vehicles", "/contract-vehicles/test-and-evaluation", "/contract-vehicles/draid", "/contract-vehicles/ai-talent-2", "/contract-vehicles/guides",
  "/ai-playground", "/ai-playground/acqbot", "/ai-playground/prompt-library",
  "/resources", "/resources/news", "/events", "/contact", "/about", "/about/impact", "/privacy",
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

test("every route fits a 320px phone without horizontal scrolling", async ({ browser, isMobile }) => {
  test.skip(!isMobile, "runs once, in the mobile project");
  test.setTimeout(120_000);
  const page = await browser.newPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, baseURL: test.info().project.use.baseURL });
  const wide: string[] = [];
  for (const route of [...ROUTES, "/employee"]) {
    await page.goto(route);
    const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: document.documentElement.clientWidth }));
    if (sw > iw) wide.push(`${route} (${sw}px)`);
  }
  expect(wide).toEqual([]);
  await page.close();
});

test("unknown route returns branded 404", async ({ page }) => {
  const res = await page.goto("/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Page not found");
});

test("legacy Wix URLs redirect permanently", async ({ request }) => {
  for (const [from, to] of [["/faqs", "/marketplace/faqs"], ["/solutions-marketplace", "/marketplace"], ["/cdao-vehicles", "/contract-vehicles"]]) {
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
    await expect(page.getByRole("link", { name: /Awardable Companies/ }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });
});

/* ------------------------------------------------------------------ mobile navigation */
const openMenu = async (page: import("@playwright/test").Page, path = "/") => {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Open menu" }).click();
  const dialog = page.getByRole("dialog", { name: "Site menu" });
  await expect(dialog).toBeVisible();
  return dialog;
};

test.describe("mobile navigation", () => {
  test("opens collapsed with focus on Close (no keyboard), and every destination is reachable", async ({ page }) => {
    const dialog = await openMenu(page);
    await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
    await expect(dialog.getByRole("searchbox", { name: "Search Tradewinds" })).not.toBeFocused();
    for (const name of ["Marketplace", "Opportunities", "AI Playground", "Contract Vehicles"]) {
      await expect(dialog.getByRole("button", { name })).toHaveAttribute("aria-expanded", "false");
    }
    for (const name of ["Home", "Events", "Contact", "Employee Portal"]) await expect(dialog.getByRole("link", { name, exact: true })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Special Topics" })).toBeHidden();
    // Every child link from the shared config is present (expanding each group in turn).
    const groups = { Marketplace: 8, Opportunities: 4, "AI Playground": 11, "Contract Vehicles": 4 };
    for (const [name, count] of Object.entries(groups)) {
      await dialog.getByRole("button", { name }).click();
      await expect(dialog.getByRole("region", { name })).toBeVisible();
      await expect(dialog.getByRole("region", { name }).getByRole("link")).toHaveCount(count);
    }
  });

  test("only one section is expanded at a time and tapping it again collapses it", async ({ page }) => {
    const dialog = await openMenu(page);
    const market = dialog.getByRole("button", { name: "Marketplace" });
    const ai = dialog.getByRole("button", { name: "AI Playground" });
    await market.click();
    await expect(market).toHaveAttribute("aria-expanded", "true");
    await ai.click();
    await expect(ai).toHaveAttribute("aria-expanded", "true");
    await expect(market).toHaveAttribute("aria-expanded", "false");
    await ai.click();
    await expect(ai).toHaveAttribute("aria-expanded", "false");
  });

  test("navigates from the accordion and closes, restoring page scroll", async ({ page }) => {
    const dialog = await openMenu(page);
    await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute("data-scroll-locked"))).toBe(true);
    await dialog.getByRole("button", { name: "Opportunities" }).click();
    await dialog.getByRole("link", { name: "Special Topics" }).click();
    await expect(page).toHaveURL(/\/opportunities\/special-topics$/);
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.documentElement.hasAttribute("data-scroll-locked"))).toBe(false);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
  });

  test("marks the current section and page", async ({ page }) => {
    const dialog = await openMenu(page, "/marketplace/faqs");
    const market = dialog.getByRole("button", { name: /Marketplace.*current section/ });
    await expect(market).toBeVisible();
    await market.click();
    await expect(dialog.getByRole("link", { name: /FAQs/ })).toHaveAttribute("aria-current", "page");
  });

  test("search ranks destinations per the brief", async ({ page }) => {
    const dialog = await openMenu(page);
    const box = dialog.getByRole("searchbox", { name: "Search Tradewinds" });
    const results = dialog.getByRole("region", { name: "Search results" }).getByRole("link");
    await box.fill("award");
    await expect(dialog.getByText("Search results — 2 matches")).toBeVisible();
    await expect(results).toHaveText([/Awardable Companies\s*Marketplace/, /Awardees\s*Marketplace/]);
    await box.fill("Prompt");
    await expect(results).toHaveText([/Prompt Library/]);
    await box.fill("contract");
    await expect(results).toHaveText([/Contract Vehicles Overview/, /DRAID/, /AI Talent 2\.0/, /T&E/]);
    await box.fill("AI");
    await expect(results.first()).toContainText("AI Playground");
    await box.fill("genai mil");
    await expect(results).toHaveText([/GenAI\.mil/]);
    await box.fill("zzqx");
    await expect(dialog.getByText("No matching pages")).toBeVisible();
    await expect(dialog.getByText("Try a different search term.")).toBeVisible();
  });

  test("search results navigate, and clearing search restores the accordion state", async ({ page }) => {
    const dialog = await openMenu(page);
    await dialog.getByRole("button", { name: "Contract Vehicles" }).click();
    const box = dialog.getByRole("searchbox", { name: "Search Tradewinds" });
    await box.fill("faq");
    await expect(dialog.getByRole("navigation", { name: "Main" })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Clear search" }).click();
    await expect(box).toHaveValue("");
    await expect(box).toBeFocused();
    await expect(dialog.getByRole("button", { name: "Contract Vehicles" })).toHaveAttribute("aria-expanded", "true");
    await box.fill("prompt");
    await box.press("Enter");
    await expect(page).toHaveURL(/\/ai-playground\/prompt-library$/);
    await expect(dialog).toBeHidden();
  });

  test("Escape clears an active search before closing, and focus returns to the menu button", async ({ page }) => {
    const dialog = await openMenu(page);
    const box = dialog.getByRole("searchbox", { name: "Search Tradewinds" });
    await box.fill("events");
    await page.keyboard.press("Escape");
    await expect(box).toHaveValue("");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });

  test("arrow keys move from the search field through results", async ({ page, isMobile }) => {
    test.skip(isMobile, "hardware keyboard behavior");
    const dialog = await openMenu(page);
    const box = dialog.getByRole("searchbox", { name: "Search Tradewinds" });
    await box.fill("award");
    await box.press("ArrowDown");
    await expect(dialog.getByRole("link", { name: /Awardable Companies/ })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(dialog.getByRole("link", { name: /Awardees/ })).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(box).toBeFocused();
  });

  test("open menu has no serious accessibility violations", async ({ page }) => {
    const dialog = await openMenu(page);
    await dialog.getByRole("button", { name: "Marketplace" }).click();
    await page.waitForTimeout(400);
    const axe = await new AxeBuilder({ page }).include("dialog[open]").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
  });

  for (const [w, h] of [[320, 568], [375, 667], [390, 844], [430, 932], [844, 390], [768, 1024]] as const) {
    test(`fits ${w}×${h}: no horizontal overflow, 44px targets, actions reachable`, async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: w, height: h }, hasTouch: true, baseURL: test.info().project.use.baseURL });
      const dialog = await openMenu(page);
      await dialog.getByRole("button", { name: "AI Playground" }).click();
      await page.waitForTimeout(400);
      const m = await page.evaluate(() => {
        const d = document.querySelector("dialog[open]") as HTMLElement;
        const small = [...d.querySelectorAll<HTMLElement>("a, button, input")]
          .filter((el) => el.offsetParent && !el.closest("[inert]"))
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.height < 43.5);
        return { sw: d.scrollWidth, cw: d.clientWidth, docSw: document.documentElement.scrollWidth, iw: innerWidth, small: small.length };
      });
      expect(m.sw).toBeLessThanOrEqual(m.cw);
      expect(m.docSw).toBeLessThanOrEqual(m.iw);
      expect(m.small).toBe(0);
      // The CTA is reachable: pinned, or at the end of the list on short screens.
      const cta = dialog.getByRole("link", { name: /Access the Marketplace/ });
      await cta.scrollIntoViewIfNeeded();
      await expect(cta).toBeVisible();
      await page.close();
    });
  }
});

test("solutions filters sync to the URL and survive reload", async ({ page }) => {
  await page.goto("/marketplace/awardable-companies");
  await page.getByLabel("Search solutions").fill("imagery");
  await expect(page).toHaveURL(/q=imagery/);
  const status = page.getByRole("status");
  await expect(status).toContainText(/of 24/);
  await page.reload();
  await expect(page.getByLabel("Search solutions")).toHaveValue("imagery");
  await page.getByLabel("Search solutions").fill("zzzz-no-match");
  await expect(page.getByText("No solutions match those filters")).toBeVisible();
});

test("awardable companies filter by aisle and show the sign-in prompt", async ({ page }) => {
  await page.goto("/marketplace/awardable-companies");
  await page.getByRole("radio", { name: /SBIR\/STTR/ }).click();
  await expect(page).toHaveURL(/aisle=SBIR/);
  await expect(page.locator("main").getByText("SBIR/STTR Aisle").first()).toBeVisible();
  await expect(page.locator("main").getByRole("link", { name: /Sign in for full details/ }).first()).toBeVisible();
});

test("opportunity status filter and archive", async ({ page }) => {
  await page.goto("/opportunities?status=closed");
  await expect(page.getByRole("radio", { name: /Closed/ })).toHaveAttribute("aria-checked", "true");
  const cards = page.locator("#all article");
  await expect(cards.first()).toContainText("Closed");
});

test("prompt library copies a prompt", async ({ page, context, browserName, isMobile }) => {
  test.skip(browserName !== "chromium");
  if (!isMobile) await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/ai-playground/prompt-library");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /Copy prompt: Write an outcome-based problem statement/ }).click();
  await expect(page.getByRole("button", { name: "Copied" }).first()).toBeVisible();
  // Headless mobile emulation stalls on clipboard reads; verify contents on desktop only.
  if (isMobile) return;
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("outcome-based problem statement");
});

test("FAQ deep link opens the answer", async ({ page }) => {
  await page.goto("/marketplace/faqs#video-length");
  await expect(page.locator("details#video-length")).toHaveAttribute("open", "");
});

test.describe("employee portal (no Supabase configured in CI)", () => {
  test("sign-in route explains the missing configuration and is not indexed", async ({ page }) => {
    await page.goto("/employee");
    await expect(page.getByRole("heading", { name: "Portal not configured" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0); // public chrome hidden
  });
  test("every portal area redirects anonymous visitors to sign-in", async ({ request }) => {
    for (const path of ["/employee/dashboard", "/employee/content/faqs", "/employee/media", "/employee/users", "/employee/settings", "/employee/audit", "/employee/mfa"]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBeGreaterThanOrEqual(300);
      expect(res.status(), path).toBeLessThan(400);
      expect(res.headers()["location"], path).toMatch(/^\/employee(\?|$)/);
    }
  });
  test("robots excludes the portal", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toMatch(/Disallow: \/employee/);
  });
});

test("events offer an add-to-calendar download", async ({ request }) => {
  const res = await request.get("/events/sample-buyer-workshop/calendar");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/calendar");
  const body = await res.text();
  expect(body).toContain("BEGIN:VCALENDAR");
  expect(body).toContain("SUMMARY:Government Buyer Workshop: From Discovery to Award");
});

test("instructional videos are organized by the brief's six categories", async ({ page }) => {
  await page.goto("/marketplace/videos");
  for (const c of ["Getting Started", "Submission Format", "Content and Criteria", "Competition Standards", "Assessment and Feedback", "Communications and Marketing"]) {
    await expect(page.getByRole("heading", { name: c, level: 2 })).toBeVisible();
  }
});

test("FAQ categories follow the brief and answers show their last update", async ({ page }) => {
  await page.goto("/marketplace/faqs?category=Vendor+Submission");
  await expect(page.getByRole("radio", { name: /Vendor Submission/ })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Expand all" }).click();
  await expect(page.getByText(/Last updated/).first()).toBeVisible();
});
