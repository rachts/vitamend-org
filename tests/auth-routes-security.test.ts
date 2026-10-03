import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  connect: vi.fn(), findOne: vi.fn(), create: vi.fn(), limit: vi.fn(), nextAuth: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ default: mocks.connect }));
vi.mock("@/models/User", () => ({ User: { findOne: mocks.findOne, create: mocks.create } }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.limit, checkRateLimit: mocks.limit }));
vi.mock("next-auth", () => ({ default: mocks.nextAuth }));
vi.mock("next-auth/providers/credentials", () => ({ default: (options: unknown) => options }));

import { POST as register } from "@/app/api/auth/register/route";
import { POST as reset } from "@/app/api/auth/reset-password/route";
import { POST as login } from "@/app/api/auth/login/route";

const request = (path: string, payload: unknown) => new NextRequest(`https://vitamend.in/api/auth/${path}`, {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
});

describe("authentication routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.limit.mockResolvedValue({ allowed: true });
    mocks.findOne.mockResolvedValue(null);
    mocks.create.mockImplementation(async (data) => ({ ...data, _id: { toString: () => "user-1" } }));
  });

  it("rejects public privileged roles before any database write", async () => {
    for (const role of ["admin", "volunteer", "Volunteer"]) {
      const response = await register(request("register", { name: "Donor", email: "donor@example.com", password: "password8", role }));
      expect(response.status).toBe(400);
    }
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it("normalizes the email and maps an allowed public role", async () => {
    const response = await register(request("register", { name: "Donor", email: " DONOR@Example.COM ", password: "password8", role: "Receive Medicines" }));
    expect(response.status).toBe(201);
    expect(mocks.findOne).toHaveBeenCalledWith({ email: "donor@example.com" });
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ email: "donor@example.com", role: "recipient" }));
  });

  it("enforces eight-character registration and reset passwords", async () => {
    expect((await register(request("register", { name: "Donor", email: "donor@example.com", password: "1234567" }))).status).toBe(400);
    expect((await reset(request("reset-password", { token: "a".repeat(64), newPassword: "1234567" }))).status).toBe(400);
    expect((await reset(request("reset-password", { token: {}, newPassword: "password8" }))).status).toBe(400);
    expect((await reset(request("reset-password", { token: "a".repeat(64), newPassword: "a".repeat(129) }))).status).toBe(400);
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it("hashes the reset token and clears single-use reset state", async () => {
    const user = { password: "old", resetPasswordToken: "old", resetPasswordExpires: new Date(), save: vi.fn() };
    mocks.findOne.mockResolvedValue(user);
    const response = await reset(request("reset-password", { token: "a".repeat(64), newPassword: "password8" }));
    expect(response.status).toBe(200);
    expect(mocks.findOne.mock.calls[0][0].resetPasswordToken).toMatch(/^[a-f0-9]{64}$/);
    expect(mocks.findOne.mock.calls[0][0].resetPasswordToken).not.toBe("a".repeat(64));
    expect(user).toMatchObject({ password: "password8", resetPasswordToken: undefined, resetPasswordExpires: undefined });
    expect(user.save).toHaveBeenCalledOnce();
  });

  it("blocks registration on rate-limit denial and keeps deprecated login closed", async () => {
    mocks.limit.mockResolvedValue({ allowed: false });
    expect((await register(request("register", {}))).status).toBe(429);
    expect(mocks.connect).not.toHaveBeenCalled();
    expect((await login()).status).toBe(410);
  });

  it("normalizes credentials and does not hit the database when login is limited", async () => {
    mocks.nextAuth.mockReturnValue({});
    await import("@/lib/auth");
    const authorize = mocks.nextAuth.mock.calls[0][0].providers[0].authorize;
    const user = { _id: { toString: () => "user-1" }, email: "donor@example.com", role: "ngo", name: "Donor", matchPassword: vi.fn().mockResolvedValue(true) };
    mocks.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(user) });
    expect(await authorize({ email: " DONOR@Example.COM ", password: "password8" }, request("callback/credentials", {}))).toMatchObject({ id: "user-1", role: "ngo" });
    expect(mocks.findOne).toHaveBeenCalledWith({ email: "donor@example.com" });
    mocks.findOne.mockClear();
    mocks.limit.mockResolvedValue({ allowed: false });
    expect(await authorize({ email: "donor@example.com", password: "password8" }, request("callback/credentials", {}))).toBeNull();
    expect(mocks.findOne).not.toHaveBeenCalled();
    expect(await authorize({ email: {}, password: "password8" }, request("callback/credentials", {}))).toBeNull();
  });
});
