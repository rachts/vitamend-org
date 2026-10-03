import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), aggregate: vi.fn(), connect: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({ default: mocks.connect }));
vi.mock("@/models/Medicine", () => ({ Medicine: { aggregate: mocks.aggregate } }));
import { GET } from "../app/api/dashboard/stats/route";

describe("dashboard stats", () => {
  beforeEach(() => vi.clearAllMocks());
  it("requires authentication", async () => {
    mocks.auth.mockResolvedValue(null);
    expect((await GET(new Request("http://localhost/api/dashboard/stats"))).status).toBe(401);
    expect(mocks.aggregate).not.toHaveBeenCalled();
  });
  it("aggregates donor records and marks untracked outcomes unavailable", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "donor-1" } });
    mocks.aggregate.mockResolvedValue([{ totalDonations: 3, donatedUnits: 8, pendingReviews: 2 }]);
    const response = await GET(new Request("http://localhost/api/dashboard/stats"));
    expect(await response.json()).toEqual({ totalDonations: 3, donatedUnits: 8, pendingReviews: 2, impactScore: null, pendingPickups: null });
    const pipeline = mocks.aggregate.mock.calls[0][0];
    expect(pipeline[0]).toEqual({ $match: { donorId: "donor-1" } });
    expect(JSON.stringify(pipeline)).not.toContain("scheduled");
  });
});
