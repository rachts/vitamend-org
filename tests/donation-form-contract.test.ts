import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Source-contract guards complement API tests; browser interaction still needs a live E2E run.
const source = readFileSync(new URL("../app/(public)/donate/donation-form.tsx", import.meta.url), "utf8");
describe("donation form wiring", () => {
  it("consumes the canonical donation receipt without a dummy ID", () => {
    expect(source).toContain("setSubmittedDonationId(result.donationId)");
    expect(source).not.toContain("result.medicineId");
    expect(source).not.toContain('"dummy"');
  });
  it("continues polling during human review and cancels obsolete requests", () => {
    expect(source).toContain('["pending", "under_review"].includes(verificationStatus)');
    expect(source).toContain("controller.abort()");
  });
  it("revokes preview URLs outside rendering", () => {
    expect(source).toContain("URL.revokeObjectURL(url)");
    expect(source).not.toContain("src={URL.createObjectURL");
  });
});
