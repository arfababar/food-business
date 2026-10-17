/* global process */
import { chromium } from "playwright";

async function runE2E() {
  console.log("Starting Playwright E2E Test Suite...");
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
    await page.waitForTimeout(500);

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

  // 5b. Verify /admin route now falls through to 404 page with Navbar and Footer
  console.log("Checking route: /admin (Falls through to 404)");
  await page.goto(`${BASE_URL}/admin`);
  await page.waitForLoadState("networkidle");
  const adminPageText = await page.innerText("body");
  if (!adminPageText.includes("404") && !adminPageText.includes("Page Not Found") && !adminPageText.includes("Craving Something That Isn't Here?")) {
    throw new Error("Expected /admin to fall through to 404 page!");
  }
  // Confirm Navbar and Footer are rendered (not hidden by old isAdmin logic)
  const hasNavbar = await page.locator("header").isVisible();
  const hasFooter = await page.locator("footer").isVisible();
  if (!hasNavbar || !hasFooter) {
    throw new Error("Expected Navbar and Footer to be rendered on /admin 404 page!");
  }

  console.log("All key routes (Home, Menu, Cart, Checkout, 404, /admin->404) verified with 0 console errors.");

  // 6. Complete Order Flow Verification: Menu -> Cart -> Checkout -> OrderSuccess
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

  // Track if any new window or popup is created (window.open)
  let popupOpened = false;
  context.on("page", () => {
    popupOpened = true;
  });

  // Confirm and Place Order
  await page.click("button:has-text('Confirm & Place Order')");
  await page.waitForURL((url) => url.pathname === "/order-success" && url.searchParams.has("order"), {
    timeout: 15000,
  });

  if (popupOpened) {
    throw new Error("Automatic WhatsApp popup / window was opened on order placement! Expected navigation only.");
  }

  const finalUrl = page.url();
  console.log("Order placed successfully. Navigated to URL:", finalUrl);
  if (!finalUrl.includes("/order-success?order=")) {
    throw new Error(`Expected URL to contain /order-success?order= but got ${finalUrl}`);
  }

  const orderNumMatch = finalUrl.match(/order=([^&]+)/);
  const currentOrderNum = orderNumMatch ? decodeURIComponent(orderNumMatch[1]) : "";

  await page.waitForSelector("text=Order Receipt", { timeout: 10000 });
  const bodyText = await page.innerText("body");
  if (bodyText.includes("undefined")) throw new Error("Found 'undefined' string on OrderSuccess page");
  if (!bodyText.includes("Almost done!")) {
    throw new Error("Missing 'Almost done!' notice on OrderSuccess");
  }
  if (!bodyText.includes("Your order is not confirmed until you send it on WhatsApp.")) {
    throw new Error("Missing 'Your order is not confirmed until you send it on WhatsApp.' copy on OrderSuccess");
  }
  if (!bodyText.toLowerCase().includes("waiting for whatsapp confirmation")) {
    throw new Error("Missing 'Waiting for WhatsApp confirmation' status on OrderSuccess");
  }

  // Verify primary WhatsApp button
  const waButton = page.locator("a:has-text('Send order on WhatsApp')");
  await waButton.waitFor({ state: "visible" });
  const waHref = await waButton.getAttribute("href");
  console.log("Verified primary WhatsApp button href:", waHref);
  if (!waHref || !waHref.startsWith("https://wa.me/")) {
    throw new Error(`Invalid WhatsApp button link: ${waHref}`);
  }
  if (!waHref.includes(encodeURIComponent(currentOrderNum)) && !waHref.includes(currentOrderNum)) {
    throw new Error(`WhatsApp button href does not contain order number ${currentOrderNum}`);
  }
  const waTarget = await waButton.getAttribute("target");
  const waRel = await waButton.getAttribute("rel");
  if (waTarget !== "_blank" || !waRel?.includes("noopener")) {
    throw new Error("WhatsApp button missing target='_blank' or rel='noopener'");
  }

  // Verify secondary hotline button
  const callButton = page.locator("a:has-text('Call us')");
  await callButton.waitFor({ state: "visible" });
  const callHref = await callButton.getAttribute("href");
  if (!callHref || !callHref.startsWith("tel:")) {
    throw new Error(`Expected tel: link for hotline button but got ${callHref}`);
  }

  // 7. Fresh Context Test A: Direct lookup of the real order placed in step 6 with zero localStorage
  console.log(`Testing fresh context A: Real order lookup (${currentOrderNum}) with zero storage...`);
  const freshContextA = await browser.newContext();
  const pageA = await freshContextA.newPage();
  await pageA.goto(`${BASE_URL}/order-success?order=${encodeURIComponent(currentOrderNum)}`);
  await pageA.waitForSelector("text=Order Receipt", { timeout: 10000 });
  const bodyTextA = await pageA.innerText("body");
  if (!bodyTextA.toUpperCase().includes(`ORDER #${currentOrderNum.toUpperCase()}`) && !bodyTextA.includes(currentOrderNum)) {
    throw new Error(`Order ${currentOrderNum} failed to load in fresh context`);
  }
  if (!bodyTextA.includes("Almost done!")) {
    throw new Error(`Missing 'Almost done!' notice on ${currentOrderNum}`);
  }
  if (!bodyTextA.toLowerCase().includes("waiting for whatsapp confirmation")) {
    throw new Error(`Missing 'Waiting for WhatsApp confirmation' status on ${currentOrderNum}`);
  }
  if (bodyTextA.includes("undefined")) throw new Error(`Found 'undefined' on ${currentOrderNum} receipt`);

  // In direct link / refresh without router state, verify fallback to short message
  const waButtonA = pageA.locator("a:has-text('Send order on WhatsApp')");
  const waHrefA = await waButtonA.getAttribute("href");
  console.log("Verified direct lookup WhatsApp href:", waHrefA);
  if (!waHrefA || !waHrefA.includes(currentOrderNum)) {
    throw new Error(`Direct lookup WhatsApp button href missing ${currentOrderNum}`);
  }
  const decodedA = decodeURIComponent(waHrefA);
  if (!decodedA.includes(`Hi Baba Hafeez, my order number is ${currentOrderNum}.`)) {
    throw new Error(`Expected short inquiry message on direct link, but got:\n${decodedA}`);
  }

  await freshContextA.close();
  console.log(`Fresh context A passed: Real order (${currentOrderNum}) loaded directly from database with short WhatsApp message.`);

  // 8. Fresh Context Test B: Bad order number (BH-999999) with zero storage
  console.log("Testing fresh context B: Non-existent order (BH-999999)...");
  const freshContextB = await browser.newContext();
  const pageB = await freshContextB.newPage();
  await pageB.goto(`${BASE_URL}/order-success?order=BH-999999`);
  await pageB.waitForSelector("text=We couldn't find that order", { timeout: 10000 });
  const bodyTextB = await pageB.innerText("body");
  if (!bodyTextB.includes("We couldn't find that order")) {
    throw new Error("Expected 'We couldn't find that order' state for non-existent order");
  }
  await freshContextB.close();
  console.log("Fresh context B passed: 'We couldn't find that order' state displayed.");

  // 9. Fresh Context Test C: Missing ?order= parameter
  console.log("Testing fresh context C: Missing ?order= query param...");
  const freshContextC = await browser.newContext();
  const pageC = await freshContextC.newPage();
  await pageC.goto(`${BASE_URL}/order-success`);
  await pageC.waitForSelector("text=No order specified", { timeout: 10000 });
  const bodyTextC = await pageC.innerText("body");
  if (!bodyTextC.includes("No order specified")) {
    throw new Error("Expected 'No order specified' state when ?order= param is missing");
  }
  if (!bodyTextC.includes("Browse Menu")) {
    throw new Error("Expected 'Browse Menu' link when ?order= param is missing");
  }
  await freshContextC.close();
  console.log("Fresh context C passed: 'No order specified' with menu link displayed.");

  if (consoleErrors.length > 0) {
    throw new Error(`Console errors detected during execution:\n${consoleErrors.join("\n")}`);
  }

  console.log(">>> All E2E OrderSuccess tests passed with 0 console errors! <<<");
  await browser.close();
}

runE2E().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
