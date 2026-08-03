import { describe, it, expect } from "vitest";
import { extractMedicineInfo } from "@/lib/extractor";
import {
  SAMPLE_LABEL_AMOXICILLIN,
  SAMPLE_LABEL_LISINOPRIL,
  SAMPLE_LABEL_EXPIRED,
  SAMPLE_LABEL_INCOMPLETE,
} from "./fixtures/sample-labels";

describe("OCR Extraction Engine (lib/extractor.ts)", () => {
  it("extracts complete medicine details from Amoxicillin label scan", () => {
    const info = extractMedicineInfo(SAMPLE_LABEL_AMOXICILLIN);

    expect(info.medicineName).toContain("AMOXICILLIN TRIHYDRATE");
    expect(info.dosage).toBe("500MG");
    expect(info.batchNumber).toBe("BTH-2025-889");
    expect(info.expiryDate).toBe("11/2027");
    expect(info.manufacturer).toContain("Sun Pharma Laboratories");
    expect(info.mrp).toBe("Rs. 145.00");
  });

  it("extracts details from Lisinopril label with varied keyword structures", () => {
    const info = extractMedicineInfo(SAMPLE_LABEL_LISINOPRIL);

    expect(info.medicineName).toContain("LISINOPRIL DIHYDRATE");
    expect(info.dosage).toBe("10MG");
    expect(info.batchNumber).toBe("LSN-99201");
    expect(info.expiryDate).toBe("08/2028");
    expect(info.manufacturer).toContain("Cipla Healthcare");
    expect(info.mrp).toBe("$24.50");
  });

  it("extracts expired label information properly for down-stream validation", () => {
    const info = extractMedicineInfo(SAMPLE_LABEL_EXPIRED);

    expect(info.medicineName).toContain("PARACETAMOL");
    expect(info.dosage).toBe("650MG");
    expect(info.batchNumber).toBe("PCM-2021-004");
    expect(info.expiryDate).toBe("03/2023");
  });

  it("handles incomplete or degraded OCR text gracefully without crashing", () => {
    const info = extractMedicineInfo(SAMPLE_LABEL_INCOMPLETE);

    expect(info.medicineName).toContain("VITAMIN C");
    expect(info.expiryDate).toBeNull();
    expect(info.batchNumber).toBeNull();
  });

  it("returns all null fields when passed empty or null inputs", () => {
    const info = extractMedicineInfo("");
    expect(info.medicineName).toBeNull();
    expect(info.dosage).toBeNull();
    expect(info.batchNumber).toBeNull();
    expect(info.expiryDate).toBeNull();
  });
});
