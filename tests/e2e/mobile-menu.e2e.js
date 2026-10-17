/* global process */
import { chromium } from "playwright";
import fs from "fs";

async function verifyMobileLayout() {
  console.log("Starting Mobile Menu Layout Playwright Verification...");
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { width: 360, height: 740, name: "360px" },
    { width: 375, height: 667, name: "375px" },
    { width: 412, height: 915, name: "412px" }
  ];

  if (!fs.existsSync("tests/screenshots")) {
    fs.mkdirSync("tests/screenshots", { recursive: true });
  }

  for (const vp of viewports) {
    console.log(`\n--- Testing ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    await page.goto("http://localhost:5173/menu");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector(".grid > div", { timeout: 10000 });

    // 1. Check no horizontal scroll on page
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth
    }));
    console.log(`[${vp.name}] scrollWidth: ${dimensions.scrollWidth}, innerWidth: ${dimensions.innerWidth}`);
    if (dimensions.scrollWidth > dimensions.innerWidth) {
      throw new Error(`Horizontal overflow detected on ${vp.name}: scrollWidth (${dimensions.scrollWidth}) > innerWidth (${dimensions.innerWidth})`);
    }

    // 2. Scroll until category tabs are pinned under the sticky navbar
    const stickyTabs = page.locator(".sticky.top-16");
    await stickyTabs.evaluate((el) => {
      // Scroll window so the top of el touches its sticky boundary (64px from top)
      const rect = el.getBoundingClientRect();
      const currentScroll = window.scrollY || window.pageYOffset;
      window.scrollTo(0, currentScroll + rect.top - 64);
    });
    await page.waitForTimeout(600);

    // 3. Count fully visible product rows on screen in the first screen after the tabs
    const visibleCardsCount = await page.evaluate(() => {
      const cards = document.querySelectorAll(".grid > div");
      const viewportHeight = window.innerHeight;
      let visible = 0;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        // Fully visible if its top is below or at the tabs bottom and its bottom is within window height
        if (rect.top >= 100 && rect.bottom <= viewportHeight + 1) {
          visible++;
        }
      });
      return visible;
    });
    console.log(`[${vp.name}] Fully visible product rows on screen after tabs: ${visibleCardsCount}`);

    // Take screenshot
    const screenshotPath = `tests/screenshots/mobile-menu-${vp.width}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`[${vp.name}] Saved screenshot to ${screenshotPath}`);

    if (visibleCardsCount < 4) {
      console.warn(`[${vp.name}] Warning: visibleCardsCount is ${visibleCardsCount} (target: 4)`);
    }

    // Verify Add button click does NOT trigger card navigation
    const firstAddBtn = page.locator(".grid > div button:has-text('Add')").first();
    await firstAddBtn.click();
    await page.waitForTimeout(300);

    const currentUrl = page.url();
    if (!currentUrl.includes("/menu") || currentUrl.includes("/menu/")) {
      throw new Error(`Tapping 'Add' navigated the page! Current URL: ${currentUrl}`);
    }

    // Verify Add button turned into stepper (- qty +)
    const stepperMinus = page.locator(".grid > div button[aria-label='Decrease quantity']").first();
    const isStepperVisible = await stepperMinus.isVisible();
    if (!isStepperVisible) {
      throw new Error("Add button did not turn into stepper after adding to cart");
    }
    console.log(`[${vp.name}] Verified Add button turned into stepper and did not navigate`);

    // Verify tapping outside the stepper on the row DOES navigate to product details
    const firstCard = page.locator(".grid > div").first();
    await firstCard.click({ position: { x: 20, y: 20 } });
    await page.waitForURL("**/menu/*", { timeout: 5000 });
    console.log(`[${vp.name}] Verified tapping row navigated to: ${page.url()}`);

    await context.close();
  }

  await browser.close();
  console.log("\n>>> Mobile Menu Layout Verification Succeeded! <<<");
}

verifyMobileLayout().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
