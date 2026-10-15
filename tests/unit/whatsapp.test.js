import { describe, it, expect } from "vitest";
import { buildWhatsAppOrderLink } from "../../src/utils/whatsapp";

describe("buildWhatsAppOrderLink", () => {
  it("formats order link with properly URL-encoded data", () => {
    const link = buildWhatsAppOrderLink({
      orderNumber: "BH-1002",
      customerName: "Ali Hassan",
      phone: "03001234567",
      address: "House 10, Street 2",
      area: "Peoples Colony",
      city: "Gujranwala",
      items: [
        { product: { name: "Classic Zinger Burger", price: 450 }, quantity: 2 },
      ],
      total: 900,
      deliveryFee: 120,
      instructions: "No pickles",
    });

    expect(link).toContain("https://wa.me/");
    expect(link).toContain("BH-1002");
    expect(link).toContain("Ali%20Hassan");
    expect(link).toContain("Classic%20Zinger%20Burger");
  });

  it("safely encodes special characters (&, #, %) and Urdu characters without corruption", () => {
    const link = buildWhatsAppOrderLink({
      orderNumber: "BH-999#1",
      customerName: "محمد علی & Sons",
      phone: "03001234567",
      address: "Shop # 15 & 16, Market 100%",
      area: "Model Town",
      city: "Gujranwala",
      items: [
        { product: { name: "Burger & Fries Combo #1", price: 650 }, quantity: 1 },
      ],
      total: 650,
      deliveryFee: 100,
      instructions: "اضافی چٹنی (Extra sauce)",
    });

    // Valid URL
    expect(() => new URL(link)).not.toThrow();
    // Decodes cleanly back to original Urdu and symbols
    const urlObj = new URL(link);
    const decodedText = urlObj.searchParams.get("text") || "";
    expect(decodedText).toContain("محمد علی & Sons");
    expect(decodedText).toContain("Shop # 15 & 16");
    expect(decodedText).toContain("اضافی چٹنی");
  });
});
