import { describe, expect, it } from "vitest";
import { donationSchema, parseDonationExpiry, packagingImageSchema } from "../lib/donation-contract";

describe("donation payload contract", () => {
  it("accepts month-only expiry without inventing a printed day", () => {
    expect(parseDonationExpiry("02/2028")?.toISOString()).toBe("2028-02-29T23:59:59.999Z");
    expect(parseDonationExpiry("2030-01-01T00:00:00.000Z")?.toISOString()).toBe("2030-01-01T00:00:00.000Z");
  });
  it.each(["", "13/2030", "02/0000", "2030-02-30", "not a date"])("rejects invalid expiry %s", (value) => {
    expect(parseDonationExpiry(value)).toBeNull();
  });
  it("requires expiry and quantity, never supplying fake defaults", () => {
    expect(donationSchema.safeParse({ medicineName: "Medicine" }).success).toBe(false);
  });
  it("retains contact, condition, brand and notes", () => {
    const data = { medicineName: "Medicine", quantity: 2, expiryDate: "12/2030", brand: "Brand", category: "Tablet", condition: "Unopened/Sealed", notes: "Pickup note", donorName: "Donor", donorEmail: "donor@example.com", donorPhone: "123", donorAddress: "Pickup" };
    expect(donationSchema.parse(data)).toEqual(data);
  });
  it("bounds packaging and validates its declared type", () => {
    expect(packagingImageSchema.safeParse({ data: "/9j/AA==", mimeType: "image/jpeg" }).success).toBe(true);
    expect(packagingImageSchema.safeParse({ data: "/9j/AA==", mimeType: "image/png" }).success).toBe(false);
    expect(packagingImageSchema.safeParse({ data: "A".repeat(800_000), mimeType: "image/jpeg" }).success).toBe(false);
  });
});
