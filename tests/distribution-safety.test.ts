import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), rate: vi.fn(), stock: vi.fn(), distribution: vi.fn(), exists: vi.fn(), create: vi.fn(), medicine: vi.fn(), notify: vi.fn(), transaction: vi.fn(), end: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({ default: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rate }));
vi.mock("@/lib/notifications", () => ({ sendNotification: mocks.notify }));
vi.mock("mongoose", () => ({ default: { isObjectIdOrHexString: (value: unknown) => typeof value === "string" && /^[a-f0-9]{24}$/.test(value), startSession: async () => ({ withTransaction: mocks.transaction, endSession: mocks.end }) } }));
vi.mock("@/models/Inventory", () => ({ Inventory: { findById: () => ({ session: mocks.stock }), findOneAndUpdate: mocks.stock } }));
vi.mock("@/models/Distribution", () => ({ DistributionStatus: ["pending", "in_transit", "delivered", "cancelled"], DistributionRecipient: ["hospital", "ngo", "community_center", "beneficiary"], Distribution: { findById: () => ({ session: mocks.distribution }), exists: () => ({ session: mocks.exists }), create: mocks.create } }));
vi.mock("@/models/Medicine", () => ({ Medicine: { findById: () => ({ session: mocks.medicine }) } }));
import { PATCH, POST } from "@/app/api/distribution/route";

const id = "aaaaaaaaaaaaaaaaaaaaaaaa";
function request(body: unknown) { return new Request("http://localhost/api/distribution", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
describe("distribution transaction safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "admin-id", role: "admin" } });
    mocks.rate.mockResolvedValue({ success: true });
    mocks.transaction.mockImplementation(async (work: () => Promise<void>) => work());
    mocks.exists.mockResolvedValue(null);
    mocks.notify.mockResolvedValue(undefined);
  });
  it("restocks cancellation exactly once and rejects its replay", async () => {
    const distribution = { status: "pending", inventoryId: id, quantity: 3, save: vi.fn() };
    const inventory = { quantity: 2, expiryDate: new Date("2099-01-01"), medicineId: "manual-stock", status: "reserved", save: vi.fn(), markModified: vi.fn() };
    mocks.distribution.mockResolvedValue(distribution);
    mocks.stock.mockResolvedValue(inventory);
    expect((await PATCH(request({ distributionId: id, status: "cancelled" }))).status).toBe(200);
    expect(inventory.quantity).toBe(5);
    expect(inventory.status).toBe("available");
    expect((await PATCH(request({ distributionId: id, status: "cancelled" }))).status).toBe(409);
    expect(inventory.quantity).toBe(5);
    expect(inventory.save).toHaveBeenCalledTimes(1);
    expect(mocks.end).toHaveBeenCalledTimes(2);
  });
  it("does not mark partially allocated donations distributed", async () => {
    mocks.stock.mockResolvedValue({ quantity: 7, save: vi.fn() });
    mocks.create.mockResolvedValue([{ status: "pending" }]);
    expect((await POST(request({ inventoryId: id, recipientType: "hospital", recipientName: "Hospital", quantity: 3 }))).status).toBe(201);
    expect(mocks.medicine).not.toHaveBeenCalled();
  });
  it("keeps a partially delivered donation approved", async () => {
    mocks.distribution.mockResolvedValue({ status: "in_transit", inventoryId: id, quantity: 3, save: vi.fn() });
    mocks.stock.mockResolvedValue({ quantity: 7, medicineId: id, status: "available", save: vi.fn(), markModified: vi.fn() });
    const medicine = { status: "approved", save: vi.fn() };
    mocks.medicine.mockResolvedValue(medicine);
    expect((await PATCH(request({ distributionId: id, status: "delivered" }))).status).toBe(200);
    expect(medicine.status).toBe("approved");
  });
  it("marks donation distributed only when all allocations have arrived", async () => {
    mocks.distribution.mockResolvedValue({ status: "in_transit", inventoryId: id, quantity: 3, save: vi.fn() });
    mocks.stock.mockResolvedValue({ quantity: 0, medicineId: id, status: "reserved", save: vi.fn(), markModified: vi.fn() });
    const medicine = { status: "approved", save: vi.fn() };
    mocks.medicine.mockResolvedValue(medicine);
    expect((await PATCH(request({ distributionId: id, status: "delivered" }))).status).toBe(200);
    expect(medicine.status).toBe("distributed");
  });
  it("rejects volunteer management before accessing stock", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "public-volunteer", role: "volunteer" } });
    expect((await POST(request({}))).status).toBe(403);
    expect((await PATCH(request({}))).status).toBe(403);
    expect(mocks.stock).not.toHaveBeenCalled();
  });
  it("rate limits mutations without database access", async () => {
    mocks.rate.mockResolvedValue({ success: false });
    expect((await PATCH(request({}))).status).toBe(429);
    expect(mocks.rate).toHaveBeenCalledWith(expect.any(Request), 30);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
