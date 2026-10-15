import { describe, it, expect } from "vitest";
import { BUSINESS_CONFIG } from "../../src/config/business";

describe("Pricing and Delivery Calculation Rules", () => {
  it("calculates delivery fee based on area when below threshold", () => {
    const subtotal = 800; // < 1500
    const area = BUSINESS_CONFIG.deliveryAreas.find((a) => a.name === "Model Town");
    const fee = subtotal >= BUSINESS_CONFIG.freeDeliveryThreshold ? 0 : area.fee;

    expect(fee).toBe(100);
    expect(subtotal + fee).toBe(900);
  });

  it("applies 100% FREE delivery when subtotal meets or exceeds threshold", () => {
    const subtotal = 1600; // >= 1500
    const area = BUSINESS_CONFIG.deliveryAreas.find((a) => a.name === "Citi Housing");
    const fee = subtotal >= BUSINESS_CONFIG.freeDeliveryThreshold ? 0 : area.fee;

    expect(fee).toBe(0);
    expect(subtotal + fee).toBe(1600);
  });
});
