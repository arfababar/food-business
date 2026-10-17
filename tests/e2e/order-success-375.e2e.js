/* global process */
import { chromium } from "playwright";

async function verifyOrderSuccessMobile() {
  console.log("Starting Playwright 375px OrderSuccess Verification...");
  const browser = await chromium.launch({ headless: true });
  // Standard iPhone SE / compact mobile viewport: 375px width x 667px height
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await context.newPage();

  const BASE_URL = "http://localhost:5173";

  // 1. Browse -> Cart -> Checkout
  await page.goto(`${BASE_URL}/menu`);
  await page.waitForLoadState("networkidle");

  // Add first product to cart using compact Add button
  const addBtn = page.locator("button:has-text('Add')").first();
  await addBtn.click();
  await page.waitForTimeout(400);

  // Navigate to Cart
  await page.click("a[href='/cart']");
  await page.waitForURL("**/cart");

  // Proceed to Checkout
  await page.click("text=Proceed to Checkout");
  await page.waitForURL("**/checkout");

  // Verify checkout reminder text is present
  const checkoutReminder = page.locator("text=After placing your order you'll send it to us on WhatsApp to confirm.");
  await checkoutReminder.waitFor({ state: "visible" });
  console.log("Verified Checkout page WhatsApp confirmation reminder is visible.");

  // Fill Checkout Form
  await page.fill("input[placeholder*='Tariq']", "Asim Munir");
  await page.fill("input[placeholder*='0300']", "0325-6800347");
  await page.fill("input[placeholder*='House']", "House 12, Street 4, Model Town");

  // Check no auto-open popup happens
  let popupOpened = false;
  context.on("page", () => {
    popupOpened = true;
  });

  // Submit order
  await page.click("button:has-text('Confirm & Place Order')");
  await page.waitForURL((url) => url.pathname === "/order-success" && url.searchParams.has("order"), {
    timeout: 15000,
  });

  if (popupOpened) {
    throw new Error("Automatic WhatsApp popup / window was opened on order placement! Expected navigation only.");
  }

  const finalUrl = page.url();
  console.log("Order placed successfully. Navigated to:", finalUrl);

  const orderNumMatch = finalUrl.match(/order=([^&]+)/);
  const currentOrderNum = orderNumMatch ? decodeURIComponent(orderNumMatch[1]) : "";
  console.log("Current Order Number:", currentOrderNum);

  // 2. Measure visibility WITHOUT scrolling on 375px phone
  // The notice and the green button MUST be visible in the initial viewport
  const noticeTitle = page.locator("h1:has-text('Almost done!')");
  await noticeTitle.waitFor({ state: "visible" });

  const noticeSubtitle = page.locator("p:has-text('Your order is not confirmed until you send it on WhatsApp.')");
  await noticeSubtitle.waitFor({ state: "visible" });

  const waButtonLocator = page.locator("a:has-text('Send order on WhatsApp')");
  await waButtonLocator.waitFor({ state: "visible" });

  const metrics = await page.evaluate(() => {
    const noticeEl = document.querySelector(".bg-amber-50");
    const waBtnEl = document.querySelector("a[href*='wa.me']");
    const viewportHeight = window.innerHeight; // 667
    const scrollY = window.scrollY; // should be 0 before scrolling

    const noticeRect = noticeEl ? noticeEl.getBoundingClientRect() : null;
    const btnRect = waBtnEl ? waBtnEl.getBoundingClientRect() : null;

    return {
      viewportHeight,
      scrollY,
      noticeTop: noticeRect?.top,
      noticeBottom: noticeRect?.bottom,
      btnTop: btnRect?.top,
      btnBottom: btnRect?.bottom,
      isNoticeVisibleAboveFold: noticeRect && noticeRect.top >= 0 && noticeRect.bottom <= viewportHeight,
      isBtnVisibleAboveFold: btnRect && btnRect.top >= 0 && btnRect.bottom <= viewportHeight,
    };
  });

  console.log("375px Viewport Above-The-Fold Metrics:", JSON.stringify(metrics, null, 2));

  if (!metrics.isNoticeVisibleAboveFold) {
    throw new Error(`Prominent notice is NOT fully visible without scrolling! Notice bottom: ${metrics.noticeBottom}, Viewport: ${metrics.viewportHeight}`);
  }

  if (!metrics.isBtnVisibleAboveFold) {
    throw new Error(`WhatsApp button is NOT fully visible without scrolling! Button bottom: ${metrics.btnBottom}, Viewport: ${metrics.viewportHeight}`);
  }

  // 3. Confirm WhatsApp button href contains order number
  const waHref = await waButtonLocator.getAttribute("href");
  console.log("Verified WhatsApp button href:", waHref);
  if (!waHref.includes(encodeURIComponent(currentOrderNum)) && !waHref.includes(currentOrderNum)) {
    throw new Error(`WhatsApp button href does not contain order number ${currentOrderNum}`);
  }

  // Save screenshot
  await page.screenshot({ path: "tests/screenshots/order-success-375.png" });
  console.log("Screenshot saved to tests/screenshots/order-success-375.png");

  await browser.close();
  console.log(">>> Playwright 375px OrderSuccess Verification Passed! <<<");
}

verifyOrderSuccessMobile().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
