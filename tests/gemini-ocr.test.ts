import { afterEach, describe, expect, it, vi } from "vitest";
import { parseGeminiOcrResponse, scanMedicineLabel } from "@/lib/ai/gemini-ocr";

const { generateContent, getGenerativeModel } = vi.hoisted(() => ({
  generateContent: vi.fn(), getGenerativeModel: vi.fn(),
}));
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class { getGenerativeModel = getGenerativeModel; },
}));
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });

describe("Gemini OCR response parsing", () => {
  it("extracts the first balanced JSON object without accepting trailing prose", () => {
    const result = parseGeminiOcrResponse(
      '```json\n{"medicineName":"AMOXICILLIN","confidence":120}\n```\nIgnore this.'
    );

    expect(result.medicineName).toBe("AMOXICILLIN");
    expect(result.confidence).toBe(100);
  });

  it("normalizes malformed field values instead of leaking them into the API", () => {
    const result = parseGeminiOcrResponse(
      '{"medicineName":42,"dosage":" 500 mg ","batchNumber":null,"confidence":-5}'
    );

    expect(result.medicineName).toBeNull();
    expect(result.dosage).toBe("500 mg");
    expect(result.batchNumber).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it("keeps escaped quotes inside medicine names", () => {
    const result = parseGeminiOcrResponse(
      '{"medicineName":"Crocin \\"Advance\\"","confidence":92}'
    );

    expect(result.medicineName).toBe('Crocin "Advance"');
  });

  it("rejects responses without a JSON object", () => {
    expect(() => parseGeminiOcrResponse("not json")).toThrow("unparseable");
  });

  it("retains an honest transcription and all ingredient strengths", () => {
    const rawText = "Supplement Plus\nIngredient A 500 mcg\nIngredient B [unreadable]\nMFD OCT 2024\nEXP SEP 2026";
    const result = parseGeminiOcrResponse(JSON.stringify({
      rawText, medicineName: "Supplement Plus", dosage: "500 mcg", confidence: 90,
      composition: [{ ingredient: "Ingredient A", strength: "500 mcg" }, { ingredient: "Ingredient B", strength: null }, null, { ingredient: 42 }],
      manufacturingDate: "OCT 2024", expiryDate: "SEP 2026", packSize: "10 capsules",
    }));
    expect(result.rawText).toBe(rawText);
    expect(result.dosage).toBe("Ingredient A: 500 mcg; Ingredient B: strength unreadable");
    expect(result.composition).toHaveLength(2);
    expect(result.manufacturingDate).toBe("OCT 2024");
    expect(result.expiryDate).toBe("SEP 2026");
    expect(result.packSize).toBe("10 capsules");
  });

  it("does not fabricate raw text from extracted fields", () => {
    expect(parseGeminiOcrResponse('{"medicineName":"Visible name"}').rawText).toBe("");
  });
});

describe("Gemini request failures", () => {
  function liveMode() {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MOCK_OCR_MODE", "false");
    vi.stubEnv("GEMINI_API_KEY", "unit-test-key");
    vi.stubEnv("GEMINI_MODEL", "retired-model");
    getGenerativeModel.mockReturnValue({ generateContent });
  }

  it("fails closed when no API key is configured outside explicit demo mode", async () => {
    liveMode();
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(scanMedicineLabel(Buffer.from("photo"))).rejects.toThrow("not configured");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("retries an explicitly retired model once using the supported default", async () => {
    liveMode();
    generateContent.mockRejectedValueOnce(Object.assign(new Error("This model is no longer available to new users"), { status: 404 }));
    generateContent.mockResolvedValueOnce({ response: { text: () => JSON.stringify({ rawText: "Brand\nEXP SEP 2026", medicineName: "Brand", confidence: 90 }) } });
    const result = await scanMedicineLabel(Buffer.from("photo"));
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(getGenerativeModel.mock.calls.map(([config]) => config.model)).toEqual(["retired-model", "gemini-flash-lite-latest"]);
    expect(result.rawText).toBe("Brand\nEXP SEP 2026");
  });

  it("does not retry or replace quota/network failures with fake medicine", async () => {
    liveMode();
    generateContent.mockRejectedValue(Object.assign(new Error("Quota exceeded"), { status: 429 }));
    await expect(scanMedicineLabel(Buffer.from("photo"))).rejects.toThrow("Quota exceeded");
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("switches an overloaded default to the alternate model only once", async () => {
    liveMode();
    vi.stubEnv("GEMINI_MODEL", "gemini-flash-lite-latest");
    generateContent.mockRejectedValue(Object.assign(new Error("Service busy"), { status: 503 }));
    await expect(scanMedicineLabel(Buffer.from("photo"))).rejects.toThrow("Service busy");
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(getGenerativeModel.mock.calls.map(([config]) => config.model)).toEqual(["gemini-flash-lite-latest", "gemini-flash-latest"]);
  });

  it("returns extracted data when an alternate model recovers from overload", async () => {
    liveMode();
    generateContent.mockRejectedValueOnce(Object.assign(new Error("Service busy"), { status: 503 }));
    generateContent.mockResolvedValueOnce({ response: { text: () => JSON.stringify({ rawText: "Capsule Plus", medicineName: "Capsule Plus", confidence: 92 }) } });
    const result = await scanMedicineLabel(Buffer.from("photo"));
    expect(result.extracted.medicineName).toBe("Capsule Plus");
    expect(generateContent).toHaveBeenCalledTimes(2);
  });
});
