import { describe, it, expect } from "vitest";
import { assertDistributionTransition, validateApproval } from "@/lib/stock-lifecycle";

describe("stock safety rules", () => {
  it.each([["pending", "in_transit"], ["pending", "cancelled"], ["in_transit", "delivered"], ["in_transit", "cancelled"]])("allows %s -> %s", (from, to) => {
    expect(() => assertDistributionTransition(from, to)).not.toThrow();
  });
  it.each([["cancelled", "cancelled"], ["delivered", "cancelled"], ["pending", "delivered"], ["in_transit", "pending"], ["delivered", "delivered"]])("rejects %s -> %s", (from, to) => {
    expect(() => assertDistributionTransition(from, to)).toThrow("Illegal or repeated");
  });
  const valid = { name: "Medicine", dosage: "10mg", batchNumber: "B1", manufacturer: "Maker", quantity: 4, expiryDate: "2099-01-01" };
  it("allows complete unexpired approval", () => expect(() => validateApproval(valid)).not.toThrow());
  it.each(["", "not-a-date", "2020-01-01", "2099-02-30", "2099-13-01"])("rejects unsafe expiry %s", expiryDate => {
    expect(() => validateApproval({ ...valid, expiryDate })).toThrow("expiry date");
  });
  it.each(["name", "dosage", "batchNumber", "manufacturer"])("requires %s", field => {
    expect(() => validateApproval({ ...valid, [field]: " " })).toThrow("required");
  });
  it.each([0, -1, 1.2, Infinity, "4"])("rejects quantity %s", quantity => {
    expect(() => validateApproval({ ...valid, quantity })).toThrow("quantity");
  });
});
