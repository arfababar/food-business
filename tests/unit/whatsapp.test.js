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

    expect(link).toContain("https://wa.me/923256800347");
    expect(link).toContain("BH-1002");
    expect(link).toContain("Ali%20Hassan");
    expect(link).toContain("Classic%20Zinger%20Burger");

    const urlObj = new URL(link);
    const decodedText = urlObj.searchParams.get("text") || "";
    expect(decodedText).toContain("*Address:* House 10, Street 2");
    expect(decodedText).toContain("*Area:* Peoples Colony, Gujranwala");
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
    expect(link).toContain("https://wa.me/923256800347");
    const decodedText = urlObj.searchParams.get("text") || "";
    expect(decodedText).toContain("محمد علی & Sons");
    expect(decodedText).toContain("*Address:* Shop # 15 & 16, Market 100%");
    expect(decodedText).toContain("*Area:* Model Town, Gujranwala");
    expect(decodedText).toContain("اضافی چٹنی");
  });

  it("builds a short inquiry link for lookups without router state", async () => {
    const { buildWhatsAppShortLink } = await import("../../src/utils/whatsapp");
    const shortLink = buildWhatsAppShortLink({
      orderNumber: "BH-1005#special",
      items: [{ quantity: 1, product: { name: "تکہ برگر & Fries" } }],
      total: 550,
    });

    expect(shortLink).toContain("https://wa.me/923256800347");
    expect(() => new URL(shortLink)).not.toThrow();

    const urlObj = new URL(shortLink);
    const text = urlObj.searchParams.get("text") || "";
    expect(text).toContain("Hi Baba Hafeez, my order number is BH-1005#special.");
    expect(text).toContain("تکہ برگر & Fries");
    expect(text).toContain("Rs. 550");
  });

  it("trims duplicate trailing area from address so area appears only once in the message", async () => {
    const link = buildWhatsAppOrderLink({
      orderNumber: "BH-1006",
      customerName: "Zahid Ahmed",
      phone: "03256800347",
      address: "House 28, Street 7, Model Town",
      area: "Model Town",
      city: "Gujranwala",
      items: [
        { product: { name: "Zinger Burger", price: 450 }, quantity: 1 },
      ],
      total: 450,
      deliveryFee: 100,
      instructions: "",
    });

    const urlObj = new URL(link);
    const text = urlObj.searchParams.get("text") || "";

    // Assert Address has the duplicate area stripped
    expect(text).toContain("*Address:* House 28, Street 7\n*Area:* Model Town, Gujranwala");

    // Assert that 'Model Town' occurs exactly once in the entire message
    const matches = text.match(/Model Town/g) || [];
    expect(matches.length).toBe(1);
  });
});

