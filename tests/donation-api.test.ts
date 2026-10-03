import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { auth, connect, create, find, pipeline } = vi.hoisted(() => ({ auth: vi.fn(), connect: vi.fn(), create: vi.fn(), find: vi.fn(), pipeline: vi.fn() }));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ default: connect }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: async () => ({ success: true }) }));
vi.mock("@/models/Medicine", () => ({ Medicine: { create, find } }));
vi.mock("@/lib/ai-verification-engine", () => ({ runVerificationPipeline: pipeline }));
import { GET, POST } from "../app/api/donations/route";

const payload = { medicineName: "Medicine", quantity: 2, expiryDate: "12/2030", brand: "Brand", condition: "Unopened/Sealed", notes: "Note", donorName: "Donor", donorEmail: "donor@example.com", donorPhone: "123", donorAddress: "Pickup", category: "Tablet" };
const request = (body: unknown) => new NextRequest("http://localhost/api/donations", { method: "POST", body: JSON.stringify(body) });

describe("donation API privacy and persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: { id: "donor-1" } });
    create.mockResolvedValue({ _id: { toString: () => "donation-1" } });
  });
  it("does not query donations for anonymous users", async () => {
    auth.mockResolvedValue(null);
    expect((await GET(new NextRequest("http://localhost/api/donations"))).status).toBe(401);
    expect(connect).not.toHaveBeenCalled();
    expect(find).not.toHaveBeenCalled();
  });
  it("returns the same donationId contract the form consumes and persists all submitted fields", async () => {
    const response = await POST(request(payload));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, donationId: "donation-1", status: "under_review" });
    const { medicineName, ...savedFields } = payload;
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ ...savedFields, name: medicineName, donorId: "donor-1", expiryDate: new Date("2030-12-31T23:59:59.999Z"), expiryLabel: "12/2030" }));
  });
  it("rejects missing expiry rather than inventing one", async () => {
    expect((await POST(request({ medicineName: "Medicine", quantity: 2 }))).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
  it("persists packaging before awaiting analysis and still returns the receipt on analysis failure", async () => {
    const base64Images = [{ data: "/9j/AA==", mimeType: "image/jpeg" }];
    let finish!: () => void;
    pipeline.mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
    const pending = POST(request({ ...payload, base64Images }));
    await vi.waitFor(() => expect(pipeline).toHaveBeenCalledWith("donation-1"));
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ packagingEvidence: base64Images }));
    finish();
    expect((await pending).status).toBe(200);
    pipeline.mockRejectedValueOnce(new Error("Unavailable"));
    expect((await POST(request({ ...payload, base64Images }))).status).toBe(200);
  });
  it("bounds JSON before parsing it", async () => {
    expect((await POST(request({ ...payload, notes: "x".repeat(4 * 1024 * 1024) }))).status).toBe(413);
    expect(create).not.toHaveBeenCalled();
  });
});
