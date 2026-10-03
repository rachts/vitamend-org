import { describe, expect, it } from "vitest";
import { normalizeEmail, normalizeUserRole, safeCallbackUrl } from "@/lib/auth-policy";
import { isAllowedMutation } from "@/lib/request-security";
import { authConfig } from "@/auth.config";

describe("authentication policy", () => {
  it("normalizes emails and preserves every supported stored role", () => {
    expect(normalizeEmail("  DONOR@Example.COM ")).toBe("donor@example.com");
    for (const role of ["user", "donor", "recipient", "ngo", "volunteer", "admin"]) {
      expect(normalizeUserRole(role)).toBe(role);
    }
    expect(normalizeUserRole("Donate Medicines")).toBe("donor");
    expect(normalizeUserRole("Receive Medicines")).toBe("recipient");
    expect(normalizeUserRole("Volunteer")).toBe("volunteer");
    for (const role of [undefined, null, {}, "__proto__", "constructor", "superadmin"]) {
      expect(normalizeUserRole(role)).toBe("user");
    }
  });

  it("only permits local callback destinations", () => {
    const base = "https://vitamend.in";
    expect(safeCallbackUrl("/inventory?filter=pending#item", base)).toBe("/inventory?filter=pending#item");
    expect(safeCallbackUrl(`${base}/profile`, base)).toBe("/profile");
    for (const value of [null, "", "//evil.test/path", "https://evil.test", "javascript:alert(1)", "/\\evil.test", "/\nevil.test", "https://name:pass@vitamend.in/profile"]) {
      expect(safeCallbackUrl(value, base)).toBe("/dashboard");
    }
  });

  it("does not trust missing or malformed JWT identity fields", async () => {
    const session = { user: { name: "Donor", id: "stale", role: "admin" }, expires: "future" };
    const callback = authConfig.callbacks.session;
    const result = await callback({ session, token: { id: 123, role: {} } } as never);
    expect(result.user).toMatchObject({ id: "", role: "user", name: "Donor" });
    const valid = await callback({ session, token: { id: "user-1", role: "ngo" } } as never);
    expect(valid.user).toMatchObject({ id: "user-1", role: "ngo" });
  });

  it("applies the same redirect policy on the Auth.js server", async () => {
    const result = await authConfig.callbacks.redirect({ url: "https://evil.test", baseUrl: "https://vitamend.in" });
    expect(result).toBe("https://vitamend.in/dashboard");
  });
});

describe("same-origin mutation policy", () => {
  const req = (path: string, headers: Record<string, string> = {}, method = "POST") =>
    new Request(`https://vitamend.in${path}`, { method, headers });

  it("rejects cross-origin and cookie-authenticated originless writes", () => {
    expect(isAllowedMutation(req("/api/inventory", { origin: "https://evil.test", cookie: "authjs.session-token=x" }))).toBe(false);
    expect(isAllowedMutation(req("/api/inventory", { cookie: "authjs.session-token=x" }))).toBe(false);
    expect(isAllowedMutation(req("/api/inventory", { "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(isAllowedMutation(req("/api/inventory", { origin: "null" }))).toBe(false);
    expect(isAllowedMutation(req("/api/inventory", { referer: "https://evil.test/form" }))).toBe(false);
  });

  it("allows same-origin writes, reads and non-cookie server clients", () => {
    expect(isAllowedMutation(req("/api/inventory", { origin: "https://vitamend.in", cookie: "authjs.session-token=x" }))).toBe(true);
    expect(isAllowedMutation(req("/api/inventory", { referer: "https://vitamend.in/dashboard", cookie: "authjs.session-token=x" }))).toBe(true);
    expect(isAllowedMutation(req("/api/inventory"))).toBe(true);
    expect(isAllowedMutation(req("/api/inventory", { origin: "https://evil.test" }, "GET"))).toBe(true);
  });

  it("exempts only Auth.js CSRF-owned routes and the signed webhook", () => {
    const headers = { origin: "https://evil.test", cookie: "session=x" };
    for (const path of ["/api/auth/callback/credentials", "/api/auth/signout", "/api/auth/session", "/api/webhooks/twilio"]) {
      expect(isAllowedMutation(req(path, headers))).toBe(true);
    }
    for (const path of ["/api/auth/register", "/api/auth/reset-password", "/api/auth/forgot-password", "/api/auth/callback-unsafe", "/api/webhooks/other"]) {
      expect(isAllowedMutation(req(path, headers))).toBe(false);
    }
  });
});
