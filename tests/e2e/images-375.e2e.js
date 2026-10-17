/* global process */
import { chromium } from "playwright";

async function verifyImagesAt375() {
  console.log("Starting Playwright 375px Image Verification on /, /menu, and /menu/1...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await context.newPage();

  const imageRequests = [];
  const forbiddenRequests = [];

  page.on("request", (req) => {
    const urlStr = req.url();
    const url = new URL(urlStr);
    const isImage = req.resourceType() === "image" || /\.(png|jpg|jpeg|webp|jfif|svg|gif|avif)(\?.*)?$/i.test(url.pathname);
    if (isImage) {
      imageRequests.push(urlStr);
      if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
        forbiddenRequests.push(urlStr);
      }
    }
  });

  const BASE_URL = "http://localhost:5173";

  const routes = [
    { url: "/", screenshot: "tests/screenshots/home-375.png", name: "Home Page (/)" },
    { url: "/menu", screenshot: "tests/screenshots/menu-375.png", name: "Menu Page (/menu)" },
    { url: "/menu/1", screenshot: "tests/screenshots/product-375.png", name: "Product Page (/menu/1)" },
  ];

  for (const route of routes) {
    console.log(`Checking route: ${route.name}...`);
    await page.goto(`${BASE_URL}${route.url}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Scroll slightly to trigger any lazy images near the top
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const imageStats = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs.map((img) => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }));
    });

    console.log(`Found ${imageStats.length} <img> elements on ${route.name}.`);

    if (imageStats.length === 0) {
      throw new Error(`Expected at least one image on ${route.name}`);
    }

    const brokenImages = imageStats.filter((img) => img.naturalWidth <= 0 || !img.complete);
    if (brokenImages.length > 0) {
      console.error("Broken images detected:", brokenImages);
      throw new Error(`Found ${brokenImages.length} broken images on ${route.name}`);
    }

    // Capture screenshot
    await page.screenshot({ path: route.screenshot, fullPage: false });
    console.log(`Verified all images have naturalWidth > 0 on ${route.name}. Screenshot saved to ${route.screenshot}`);
  }

  await browser.close();

  console.log("\n================ ALL IMAGE REQUESTS OBSERVED ================");
  const uniqueImageRequests = Array.from(new Set(imageRequests));
  uniqueImageRequests.forEach((reqUrl, index) => {
    console.log(`${index + 1}. ${reqUrl}`);
  });
  console.log(`Total image requests: ${imageRequests.length} (Unique: ${uniqueImageRequests.length})`);
  console.log("=============================================================\n");

  if (forbiddenRequests.length > 0) {
    throw new Error(`Forbidden remote image requests detected (${forbiddenRequests.length}):\n${forbiddenRequests.join("\n")}`);
  }

  console.log(">>> SUCCESS: 0 external image requests! All images served locally. <<<");
}

verifyImagesAt375().catch((err) => {
  console.error("Image verification failed:", err);
  process.exit(1);
});

