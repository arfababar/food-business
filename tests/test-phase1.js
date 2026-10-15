/* global process */
import { chromium } from "playwright";

async function runTests() {
  console.log("Starting browser tests for Phase 1...");
  const browser = await chromium.launch({ headless: true });

  const BASE_URL = "http://localhost:5173";

  // 1. Desktop Test (1280x800)
  console.log("\n--- Testing Desktop Viewport (1280x800) ---");
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const desktopPage = await desktopContext.newPage();

  // Test Home
  await desktopPage.goto(BASE_URL);
  await desktopPage.waitForLoadState("networkidle");
  const homeTitle = await desktopPage.title();
  console.log(`[Desktop] Page Title: ${homeTitle}`);
  if (!homeTitle.includes("Baba Hafeez")) throw new Error("Title does not include Baba Hafeez");

  // Verify Gujranwala presence and no Halal presence
  const homeContent = await desktopPage.content();
  if (!homeContent.includes("Gujranwala")) throw new Error("Home page does not mention Gujranwala");
  if (homeContent.toLowerCase().includes("halal")) throw new Error("Home page still contains Halal text!");
  console.log("[Desktop] Verified: Mentions Gujranwala, Halal tags removed.");

  // Test Menu Page
  await desktopPage.click("text=Menu");
  await desktopPage.waitForURL("**/menu");
  console.log("[Desktop] Navigated to /menu successfully.");

  // Click on a category tab (e.g. Value Deals)
  await desktopPage.click("text=Value Deals");
  await desktopPage.waitForTimeout(500);
  const dealsUrl = desktopPage.url();
  console.log(`[Desktop] Category filter active URL: ${dealsUrl}`);

  // Click on "Classic Zinger Burger" or first product
  await desktopPage.click("text=All Items");
  await desktopPage.waitForTimeout(500);
  await desktopPage.click("text=Classic Zinger Burger");
  await desktopPage.waitForURL("**/menu/1");
  console.log("[Desktop] Navigated to ProductDetails /menu/1 successfully.");

  // Add to cart from ProductDetails
  await desktopPage.click("button:has-text('Add to Cart')");
  console.log("[Desktop] Clicked 'Add to Cart'.");
  await desktopPage.waitForTimeout(600);

  // Navigate to Cart
  await desktopPage.click("a[href='/cart']");
  await desktopPage.waitForURL("**/cart");
  console.log("[Desktop] Navigated to /cart.");
  const cartContent = await desktopPage.content();
  if (!cartContent.includes("Classic Zinger Burger")) throw new Error("Item not found in cart");
  if (cartContent.toLowerCase().includes("crunchy") && cartContent.toLowerCase().includes("promo")) {
    throw new Error("Promo code still present on Cart page!");
  }
  console.log("[Desktop] Cart renders items correctly without promo code system.");

  // Click Proceed to Checkout
  await desktopPage.click("text=Proceed to Checkout");
  await desktopPage.waitForURL("**/checkout");
  console.log("[Desktop] Navigated to /checkout.");

  // Fill in checkout form
  await desktopPage.fill("input[placeholder*='Tariq']", "Ali Hassan");
  await desktopPage.fill("input[placeholder*='0300']", "03001234567");
  await desktopPage.fill("input[placeholder*='House']", "House 12, Street 4, Model Town");
  
  // Submit order
  await desktopPage.click("button:has-text('Confirm & Place Order')");
  await desktopPage.waitForURL("**/order-success", { timeout: 10000 });
  await desktopPage.waitForSelector("text=Order #");
  console.log("[Desktop] Order placed successfully! Reached /order-success.");

  const successContent = await desktopPage.content();
  if (!successContent.includes("Ali Hassan")) {
    console.log("Body snippet:", (await desktopPage.innerText("body")).slice(0, 1000));
    throw new Error("Customer name missing on receipt");
  }
  if (!successContent.includes("Cash on Delivery")) throw new Error("Payment method not COD");
  console.log("[Desktop] Verified order receipt and COD confirmation.");

  await desktopContext.close();

  // 2. Mobile Test (375x667 - iPhone SE / Standard Mobile)
  console.log("\n--- Testing Mobile Viewport (375x667) ---");
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto(BASE_URL);
  await mobilePage.waitForLoadState("networkidle");
  console.log("[Mobile] Home page loaded on 375px viewport.");

  // Check mobile hamburger menu
  const menuButton = mobilePage.locator("button[aria-label='Toggle Menu']");
  await menuButton.click();
  await mobilePage.waitForTimeout(300);
  console.log("[Mobile] Hamburger menu opened.");

  // Click "Contact" in mobile menu
  await mobilePage.click("div.md\\:hidden a[href='/contact']");
  await mobilePage.waitForURL("**/contact");
  console.log("[Mobile] Navigated to /contact via mobile menu.");

  const contactContent = await mobilePage.content();
  if (!contactContent.includes("Model Town, Gujranwala")) {
    throw new Error("Contact page does not mention Gujranwala address");
  }
  console.log("[Mobile] Contact page verified on mobile.");

  // Navigate to About
  await menuButton.click();
  await mobilePage.waitForTimeout(300);
  await mobilePage.click("div.md\\:hidden a[href='/about']");
  await mobilePage.waitForURL("**/about");
  console.log("[Mobile] About page verified on mobile.");

  await mobileContext.close();
  await browser.close();

  console.log("\n>>> ALL PHASE 1 BROWSER TESTS PASSED! <<<");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
