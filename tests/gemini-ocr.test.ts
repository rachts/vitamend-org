import { describe, expect, it } from "vitest";
import { parseGeminiOcrResponse } from "@/lib/ai/gemini-ocr";

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

  it("rejects responses without a JSON object", () => {
    expect(() => parseGeminiOcrResponse("not json")).toThrow("unparseable");
  });
});
