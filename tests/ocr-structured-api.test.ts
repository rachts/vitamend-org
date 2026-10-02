import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ocr/route";
import { scanMedicineLabel } from "@/lib/ai/gemini-ocr";

vi.mock("@/lib/ai/gemini-ocr", () => ({ scanMedicineLabel: vi.fn(), OCR_TIMEOUT_MS: 45000 }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(async () => ({ success: true })) }));

afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });

function request() {
  const form = new FormData();
  form.append("image", new File(["photo"], "label.jpg", { type: "image/jpeg" }));
  return new NextRequest("http://localhost/api/ocr", { method: "POST", body: form });
}

describe("Structured OCR API evidence", () => {
  it("preserves optional label data, uncertain strength and expired status", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-02T12:00:00Z"));
    const rawText = "Capsule Plus\nIngredient A 500 mcg\nIngredient B [unreadable]\nMFD OCT 2024\nEXP SEP 2026";
    vi.mocked(scanMedicineLabel).mockResolvedValue({
      rawText, confidence: 92,
      extracted: {
        medicineName: "Capsule Plus", dosage: null, batchNumber: "ABC123", expiryDate: "SEP 2026",
        manufacturer: "Example Pharmaceuticals", mrp: "Rs. 160", confidence: 92,
        composition: [{ ingredient: "Ingredient A", strength: "500 mcg" }, { ingredient: "Ingredient B", strength: null }],
        manufacturingDate: "OCT 2024", packSize: "10 capsules",
      },
    });
    const response = await POST(request());
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.rawText).toBe(rawText);
    expect(result.raw_text).toBe(rawText);
    expect(result.extracted.dosage).toBeNull();
    expect(result.extracted.composition).toHaveLength(2);
    expect(result.extracted.manufacturingDate).toBe("OCT 2024");
    expect(result.extracted.packSize).toBe("10 capsules");
    expect(result.expired).toBe(true);
    expect(result.validation.isValid).toBe(false);
    expect(result.needs_review).toBe(true);
  });

  it("returns an unavailable service instead of fake data when the key is missing", async () => {
    vi.mocked(scanMedicineLabel).mockRejectedValue(new Error("GEMINI_API_KEY is not configured"));
    const response = await POST(request());
    expect(response.status).toBe(503);
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.extracted).toBeUndefined();
  });

  it("reports upstream overload without exposing provider diagnostics", async () => {
    vi.mocked(scanMedicineLabel).mockRejectedValue(Object.assign(new Error("Private provider URL"), { status: 503 }));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("Private provider URL");
  });
});
