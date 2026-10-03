import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({ default: () => ({ auth: (handler: unknown) => handler }) }));
import middleware, { config } from "@/middleware";

// Auth.js's wrapper supplies auth/nextUrl; here we exercise the actual middleware
// handler without signing JWTs or opening a server.
function run(path: string, options: { method?: string; origin?: string; cookie?: string; auth?: unknown } = {}) {
  const url = new URL(`https://vitamend.in${path}`);
  const request = {
    url: url.toString(), nextUrl: url, method: options.method ?? "GET", auth: options.auth,
    headers: new Headers({ ...(options.origin ? { origin: options.origin } : {}), ...(options.cookie ? { cookie: options.cookie } : {}) }),
  };
  return (middleware as unknown as (req: unknown) => Response)(request);
}

describe("middleware authentication boundaries", () => {
  it("rejects a cross-origin API mutation without advertising CORS", () => {
    const response = run("/api/inventory", { method: "PATCH", origin: "https://evil.test", cookie: "authjs.session-token=x" });
    expect(response.status).toBe(403);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
    expect(response.headers.get("access-control-allow-credentials")).toBeNull();
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("keeps Auth.js callback and signed webhook handling in their owning routes", () => {
    expect(run("/api/auth/callback/credentials", { method: "POST", origin: "https://evil.test" }).status).toBe(200);
    expect(run("/api/webhooks/twilio", { method: "POST" }).status).toBe(200);
    expect(run("/api/auth/register", { method: "POST", origin: "https://evil.test" }).status).toBe(403);
  });

  it("requires a real session identity and applies exact admin path boundaries", () => {
    expect(run("/dashboard?view=all", { auth: { user: { id: "" } } }).headers.get("location"))
      .toBe("https://vitamend.in/auth/signin?callbackUrl=%2Fdashboard%3Fview%3Dall");
    expect(run("/admin", { auth: { user: { id: "user-1", role: "donor" } } }).headers.get("location"))
      .toBe("https://vitamend.in/dashboard");
    expect(run("/admin", { auth: { user: { id: "admin-1", role: "admin" } } }).status).toBe(200);
    expect(run("/administrator").status).toBe(200);
  });

  it("matches APIs even when an API pathname resembles a static asset", () => {
    expect(config.matcher[0]).toBe("/api/:path*");
    const pageMatcher = new RegExp(`^${config.matcher[1]}$`);
    expect(pageMatcher.test("/_next/static/chunk.js")).toBe(false);
    expect(pageMatcher.test("/icons/logo.svg")).toBe(false);
    expect(pageMatcher.test("/dashboard")).toBe(true);
  });
});
