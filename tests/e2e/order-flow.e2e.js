/* global process */
import { chromium } from "playwright";

async function runE2E() {
  console.log("Starting Playwright E2E Test with Console Error Detection...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      console.error(`[Browser Console Error]: ${text}`);
      consoleErrors.push(`Console error: ${text}`);
    }
  });

  page.on("pageerror", (err) => {
    console.error(`[Browser Page Error]: ${err.message}`);
    consoleErrors.push(`Page error: ${err.message}`);
  });

  const BASE_URL = "http://localhost:5173";

  // Helper function to check for console errors on a specific page
  async function visitAndCheck(urlPath, pageName) {
    console.log(`Checking route: ${urlPath} (${pageName})`);
    await page.goto(`${BASE_URL}${urlPath}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500); // Allow any delayed hydration or render effects to execute

    if (consoleErrors.length > 0) {
      throw new Error(`Console errors detected on ${pageName} (${urlPath}):\n${consoleErrors.join("\n")}`);
    }
  }

  // 1. Check Home
  await visitAndCheck("/", "Home Page");

  // 2. Check Menu
  await visitAndCheck("/menu", "Menu Page");

  // 3. Check Cart
  await visitAndCheck("/cart", "Cart Page");

  // 4. Check Checkout
  await visitAndCheck("/checkout", "Checkout Page");

  // 5. Check 404 URL
  await visitAndCheck("/non-existent-page-test-404", "404 Page");

  console.log("All key routes (Home, Menu, Cart, Checkout, 404) verified with 0 console errors.");

  // Full Purchase Flow Verification
  console.log("Verifying complete ordering flow (Browse -> Add to Cart -> Checkout -> Success)...");
  await page.goto(`${BASE_URL}/menu`);
  await page.waitForLoadState("networkidle");

  // Select a product
  await page.click("text=Classic Zinger Burger");
  await page.waitForURL("**/menu/1");
  await page.waitForTimeout(500);

  // Add to Cart
  await page.click("button:has-text('Add to Cart')");
  await page.waitForTimeout(500);

  // Open Cart
  await page.click("a[href='/cart']");
  await page.waitForURL("**/cart");

  // Proceed to Checkout
  await page.click("text=Proceed to Checkout");
  await page.waitForURL("**/checkout");

  // Fill Pakistani Checkout Form
  await page.fill("input[placeholder*='Tariq']", "Hamza Mehmood");
  await page.fill("input[placeholder*='0300']", "0300-7654321");
  await page.fill("input[placeholder*='House']", "House 28, Street 7, Model Town");

  // Confirm and Place Order
  await page.click("button:has-text('Confirm & Place Order')");
  await page.waitForURL("**/order-success", { timeout: 10000 });
  await page.waitForSelector("text=Order #");

  const content = await page.content();
  if (!content.includes("Hamza Mehmood")) throw new Error("Customer name missing on receipt");
  if (!content.includes("Cash on Delivery")) throw new Error("Payment method mismatch");

  if (consoleErrors.length > 0) {
    throw new Error(`Console errors detected during execution:\n${consoleErrors.join("\n")}`);
  }

  console.log(">>> Playwright E2E Test Passed with 0 Console Errors! <<<");
  await browser.close();
}

runE2E().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
