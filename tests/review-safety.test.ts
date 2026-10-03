import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), rate: vi.fn(), medicine: vi.fn(), existing: vi.fn(), inventory: vi.fn(), log: vi.fn(), learning: vi.fn(), notify: vi.fn(), transaction: vi.fn(), end: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({ default: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rate }));
vi.mock("@/lib/notifications", () => ({ sendNotification: mocks.notify }));
vi.mock("mongoose", () => ({ default: { isObjectIdOrHexString: () => true, startSession: async () => ({ withTransaction: mocks.transaction, endSession: mocks.end }) } }));
vi.mock("@/models/Medicine", () => ({ Medicine: { findById: () => ({ session: mocks.medicine }) } }));
vi.mock("@/models/Inventory", () => ({ Inventory: { findOne: () => ({ session: mocks.existing }), create: mocks.inventory } }));
vi.mock("@/models/VerificationLog", () => ({ VerificationLog: { create: mocks.log } }));
vi.mock("@/models/AILearningDataset", () => ({ AILearningDataset: { create: mocks.learning } }));
import { POST } from "@/app/api/admin/review/route";
const id = "aaaaaaaaaaaaaaaaaaaaaaaa";
function request(correctedData?: unknown) { return new Request("http://localhost/api/admin/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ medicineId: id, decision: "approved", correctedData }) }); }
function medicine() {
  const fields = { name: "Medicine", dosage: "10mg", batchNumber: "B1", manufacturer: "Maker", quantity: 4, expiryDate: new Date("2099-01-01") };
  return { ...fields, _id: id, status: "under_review", donorId: "donor", save: vi.fn(), toObject: () => fields };
}
describe("manual review safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "admin", role: "admin" } });
    mocks.rate.mockResolvedValue({ success: true });
    mocks.transaction.mockImplementation(async (work: () => Promise<void>) => work());
    mocks.existing.mockResolvedValue(null);
    mocks.notify.mockResolvedValue(undefined);
  });
  it.each(["", "not-a-date", "2020-01-01"])("refuses unsafe corrected expiry %s before writing", async expiryDate => {
    const med = medicine();
    mocks.medicine.mockResolvedValue(med);
    expect((await POST(request({ expiryDate }))).status).toBe(400);
    expect(med.save).not.toHaveBeenCalled();
    expect(mocks.inventory).not.toHaveBeenCalled();
    expect(mocks.learning).not.toHaveBeenCalled();
  });
  it("refuses missing corrected required fields", async () => {
    mocks.medicine.mockResolvedValue(medicine());
    expect((await POST(request({ batchNumber: " " }))).status).toBe(400);
    expect(mocks.inventory).not.toHaveBeenCalled();
  });
  it("creates inventory once and rejects repeated review", async () => {
    const med = medicine();
    mocks.medicine.mockResolvedValue(med);
    expect((await POST(request())).status).toBe(200);
    expect((await POST(request())).status).toBe(409);
    expect(mocks.inventory).toHaveBeenCalledTimes(1);
    expect(mocks.inventory).toHaveBeenCalledWith(expect.any(Array), { session: expect.any(Object) });
    expect(mocks.end).toHaveBeenCalledTimes(2);
  });
  it("returns conflict if inventory already exists", async () => {
    mocks.medicine.mockResolvedValue(medicine());
    mocks.existing.mockResolvedValue({ donationId: id });
    expect((await POST(request())).status).toBe(409);
    expect(mocks.inventory).not.toHaveBeenCalled();
  });
  it("does not report failure after committed approval if notification fails", async () => {
    mocks.medicine.mockResolvedValue(medicine());
    mocks.notify.mockRejectedValue(new Error("notification unavailable"));
    expect((await POST(request())).status).toBe(200);
  });
  it("rejects public volunteers", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "volunteer", role: "volunteer" } });
    expect((await POST(request())).status).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
