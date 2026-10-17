import { describe, it, expect } from "vitest";
import { resolveProductImage } from "../../src/services/api";

describe("resolveProductImage", () => {
  it("replaces remote image_url https://example.com/x.jpg with matching local path", () => {
    // Product 1 (Classic Zinger Burger) with remote image
    const localPath = resolveProductImage("https://example.com/x.jpg", 1, "Classic Zinger Burger");
    expect(localPath).toBe("/images/products/classic-zinger.webp");
    expect(localPath.startsWith("/images/")).toBe(true);
    expect(localPath.startsWith("http")).toBe(false);
  });

  it("matches by name if id is not found and replaces remote image with local path", () => {
    const localPath = resolveProductImage("https://example.com/x.jpg", 9999, "Smash Beef Gourmet Burger");
    expect(localPath).toBe("/images/products/smash-beef.webp");
    expect(localPath.startsWith("/images/")).toBe(true);
  });

  it("handles protocol-relative remote URLs (//cdn.example.com/img.png)", () => {
    const localPath = resolveProductImage("//cdn.example.com/img.png", 2, "Crispy Chicken Deluxe");
    expect(localPath).toBe("/images/products/crispy-chicken.webp");
  });

  it("falls back to /images/placeholder.svg if product is completely unknown and image is remote or missing", () => {
    const fromRemote = resolveProductImage("https://example.com/unknown.jpg", 8888, "Unknown Mystery Item");
    expect(fromRemote).toBe("/images/placeholder.svg");

    const fromMissing = resolveProductImage(null, 8888, "Unknown Mystery Item");
    expect(fromMissing).toBe("/images/placeholder.svg");
  });

  it("preserves already local image paths", () => {
    const localInput = "/images/products/custom-burger.webp";
    const result = resolveProductImage(localInput, 1, "Classic Zinger Burger");
    expect(result).toBe("/images/products/custom-burger.webp");
  });
});
