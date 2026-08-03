import { describe, it, expect } from "vitest";
import { validateMedicineDetails, parseExpiryToDate } from "@/lib/validator";
import { ExtractedMedicineDetails } from "@/types/medicine";

describe("Pharmaceutical Regulatory & Safety Validator (lib/validator.ts)", () => {
  it("approves safe, non-expired medicine submissions with complete identifiers", () => {
    const validDetails: ExtractedMedicineDetails = {
      medicineName: "AMOXICILLIN TRIHYDRATE CAPSULES 500mg",
      dosage: "500MG",
      batchNumber: "BTH-2025-889",
      expiryDate: "12/2028",
      manufacturer: "Sun Pharma Laboratories Ltd.",
      mrp: "Rs. 145.00",
    };

    const result = validateMedicineDetails(validDetails);
    expect(result.isValid).toBe(true);
    expect(result.expiryValid).toBe(true);
    expect(result.batchValid).toBe(true);
    expect(result.hasRequiredFields).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.summary).toContain("verified safe");
  });

  it("fails validation with high-severity error when medicine has expired", () => {
    const expiredDetails: ExtractedMedicineDetails = {
      medicineName: "PARACETAMOL TABLETS 650mg",
      dosage: "650MG",
      batchNumber: "PCM-2021-004",
      expiryDate: "03/2023",
      manufacturer: "Abbott India Ltd.",
      mrp: "Rs. 30.00",
    };

    const result = validateMedicineDetails(expiredDetails);
    expect(result.isValid).toBe(false);
    expect(result.expiryValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "expiryDate",
          severity: "error",
          message: expect.stringContaining("already expired"),
        }),
      ])
    );
  });

  it("fails validation when mandatory batch number is missing", () => {
    const missingBatch: ExtractedMedicineDetails = {
      medicineName: "LISINOPRIL TABLETS 10mg",
      dosage: "10MG",
      batchNumber: null,
      expiryDate: "08/2028",
      manufacturer: "Cipla Healthcare",
      mrp: "$24.50",
    };

    const result = validateMedicineDetails(missingBatch);
    expect(result.isValid).toBe(false);
    expect(result.batchValid).toBe(false);
    expect(result.errors?.[0]?.field).toBe("batchNumber");
  });

  it("emits advisory warnings for missing secondary attributes without rejecting valid treatments", () => {
    const minimalDetails: ExtractedMedicineDetails = {
      medicineName: "METFORMIN HCL TABLETS",
      dosage: null,
      batchNumber: "MTF-8891",
      expiryDate: "10/2027",
      manufacturer: null,
      mrp: null,
    };

    const result = validateMedicineDetails(minimalDetails);
    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "dosage" }),
        expect.objectContaining({ field: "manufacturer" }),
      ])
    );
  });
});

describe("Expiry Date Parsing Helpers", () => {
  it("parses MM/YYYY format correctly", () => {
    const date = parseExpiryToDate("11/2027");
    expect(date?.getFullYear()).toBe(2027);
    expect(date?.getMonth()).toBe(10); // 0-indexed November is 10
  });

  it("parses DD/MM/YYYY format correctly", () => {
    const date = parseExpiryToDate("31/12/2026");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(11); // December
    expect(date?.getDate()).toBe(31);
  });

  it("parses short month and year textual formats (NOV 2027)", () => {
    const date = parseExpiryToDate("NOV 2027");
    expect(date?.getFullYear()).toBe(2027);
    expect(date?.getMonth()).toBe(10);
  });
});
