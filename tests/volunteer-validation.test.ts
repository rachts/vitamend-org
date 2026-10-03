import { describe, expect, it } from "vitest";
import { volunteerApplicationSchema } from "../lib/volunteer-validation";

const application = { fullName: "Test Volunteer", email: "test@example.com", phone: "", city: "Pune", qualification: "", role: "Medical Volunteer", availability: "Part-time (2-5 hrs/wk)" };
describe("volunteer form contract", () => {
  it("accepts the actual short form without legacy required fields", () => {
    expect(volunteerApplicationSchema.safeParse(application).success).toBe(true);
  });
  it("bounds fields and rejects status injection and invalid roles", () => {
    for (const fields of [{ city: "x".repeat(121) }, { qualification: "x".repeat(1001) }, { status: "approved" }, { role: "admin" }, { availability: {} }, { email: "invalid" }]) {
      expect(volunteerApplicationSchema.safeParse({ ...application, ...fields }).success).toBe(false);
    }
  });
});
