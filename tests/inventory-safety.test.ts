import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), rate: vi.fn(), create: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({ default: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rate }));
vi.mock("@/models/Inventory", () => ({ Inventory: { create: mocks.create } }));
import { POST } from "@/app/api/inventory/route";
function request(fields: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Medicine", quantity: 4, expiryDate: "2099-01-01", ...fields }) });
}
describe("inventory input and access safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "admin", role: "admin" } });
    mocks.rate.mockResolvedValue({ success: true });
    mocks.create.mockResolvedValue({ name: "Medicine" });
  });
  it.each([1.5, -1, 0, "4", 100001])("rejects invalid quantity %s without writes", async quantity => {
    expect((await POST(request({ quantity }))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it.each(["2099-02-30", "2020-01-01", "not-a-date"])("rejects invalid or expired date %s", async expiryDate => {
    expect((await POST(request({ expiryDate }))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects volunteer manual stock creation", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "volunteer", role: "volunteer" } });
    expect((await POST(request())).status).toBe(403);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("confirms successful admin creation", async () => {
    const response = await POST(request());
    expect(response.status).toBe(201);
    expect((await response.json()).success).toBe(true);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ quantity: 4, status: "available" }));
  });
});
