import { beforeEach, describe, expect, it, vi } from "vitest";

const { generate, find, update, record } = vi.hoisted(() => {
  process.env.GEMINI_API_KEY = "test-key";
  return { generate: vi.fn(), find: vi.fn(), update: vi.fn(), record: vi.fn() };
});
vi.mock("@google/generative-ai", () => ({ GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
  getGenerativeModel: () => ({ generateContent: generate }),
})) }));
vi.mock("@/models/Medicine", () => ({ Medicine: {
  findById: () => ({ select: find }),
  find: () => ({ select: () => ({ limit: () => ({ lean: async () => [] }) }) }),
  updateOne: update,
} }));
vi.mock("@/models/VerificationLog", () => ({ VerificationLog: { create: record } }));
vi.mock("../lib/notifications", () => ({ notifyReviewers: vi.fn() }));
import { runVerificationPipeline } from "../lib/ai-verification-engine";

const evidence = [{ data: "/9j/AA==", mimeType: "image/jpeg" }];
const response = (value: unknown) => ({ response: { text: () => JSON.stringify(value) } });

describe("donation analysis requires human review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    find.mockResolvedValue({ _id: "123", name: "Donor name", status: "under_review", packagingEvidence: evidence });
  });

  it.each(["2030-01-01", "2020-01-01", undefined])("never approves or rejects even with expiry %s", async (expiryDate) => {
    generate.mockResolvedValueOnce(response({ name: "OCR name", expiryDate, confidence: 99 }))
      .mockResolvedValueOnce(response({ isTampered: false, tamperConfidence: 99, isRecalled: false, recallReason: null, aiReasoning: "Photo only" }));
    const result = await runVerificationPipeline("123");
    expect(result.success).toBe(true);
    expect(result.decision).toBe("under_review");
    const changes = update.mock.calls[0][1].$set;
    expect(changes.status).toBe("under_review");
    expect(changes.name).toBeUndefined();
    expect(changes.expiryDate).toBeUndefined();
    expect(changes.verificationResult.aiReasoning).toContain("Pharmacist inspection required");
    expect(changes.verificationResult.isExpired).toBe(expiryDate ? expiryDate === "2020-01-01" : undefined);
    expect(generate.mock.calls[0][0][1].inlineData).toEqual(evidence[0]);
  });

  it("does not overwrite a human-reviewed record", async () => {
    find.mockResolvedValue({ status: "approved", packagingEvidence: evidence });
    expect((await runVerificationPipeline("123")).success).toBe(false);
    expect(generate).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("limits failure updates to still-unreviewed records", async () => {
    generate.mockRejectedValueOnce(new Error("Unavailable"));
    expect((await runVerificationPipeline("123")).success).toBe(false);
    expect(update).toHaveBeenCalledWith({ _id: "123", status: { $in: ["pending", "under_review"] } }, { $set: { status: "under_review" } });
  });
});
