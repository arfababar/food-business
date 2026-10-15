import { describe, it, expect } from "vitest";
import { checkoutSchema, PAKISTANI_PHONE_REGEX } from "../../src/lib/validation";

describe("Pakistani Phone Number Regex", () => {
  it("accepts valid Pakistani mobile numbers", () => {
    expect(PAKISTANI_PHONE_REGEX.test("03001234567")).toBe(true);
    expect(PAKISTANI_PHONE_REGEX.test("0300-1234567")).toBe(true);
    expect(PAKISTANI_PHONE_REGEX.test("+923001234567")).toBe(true);
    expect(PAKISTANI_PHONE_REGEX.test("923001234567")).toBe(true);
    expect(PAKISTANI_PHONE_REGEX.test("03217654321")).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(PAKISTANI_PHONE_REGEX.test("12345")).toBe(false);
    expect(PAKISTANI_PHONE_REGEX.test("0213567890")).toBe(false); // Landline
    expect(PAKISTANI_PHONE_REGEX.test("0300123456")).toBe(false); // Too short
    expect(PAKISTANI_PHONE_REGEX.test("abcdefghijk")).toBe(false);
  });
});

describe("Checkout Zod Schema", () => {
  it("validates correct customer data", () => {
    const validData = {
      fullName: "Hamza Tariq",
      phone: "03001234567",
      address: "House 42, Street 3, Model Town",
      area: "Model Town",
      city: "Gujranwala",
      instructions: "Please ring doorbell",
    };
    const result = checkoutSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when full name is missing or too short", () => {
    const invalidData = {
      fullName: "A",
      phone: "03001234567",
      address: "House 42, Model Town",
      area: "Model Town",
    };
    const result = checkoutSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("fails when address is too short", () => {
    const invalidData = {
      fullName: "Hamza Tariq",
      phone: "03001234567",
      address: "H4",
      area: "Model Town",
    };
    const result = checkoutSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
