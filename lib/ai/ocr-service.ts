/**
 * OCR Service for VitaMend
 * Developed by Rachit
 *
 * This client service interfaces with Next.js Google Gemini OCR route (/api/ocr)
 * to extract medicine packaging details and perform regulatory safety validation.
 */
import { OCRApiResponse, ExtractedMedicineDetails, MedicineValidationResult } from "@/types/medicine";

export type OCRCheckResponse = OCRApiResponse & {
  expiry?: string | null;
  batch?: string | null;
  medicine_name?: string | null;
  qr_expiry?: string | null;
  expired?: boolean;
  tampered?: boolean;
  needs_review?: boolean;
  mismatch?: boolean;
  raw_text?: string;
};

export class OCRService {
  /**
   * Processes a medicine image through the Next.js Google Gemini API route.
   * Extracts label information (name, dosage, batch, expiry) and validates product safety.
   */
  static async processImage(file: File): Promise<OCRCheckResponse> {
    try {
      const formData = new FormData();
      // Send under 'image' per Gemini Next.js specification, and 'file' for backward compatibility
      formData.append("image", file);
      formData.append("file", file);

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data: OCRCheckResponse = await response.json();

      if (!response.ok || data.success === false) {
        const errorMsg = data.error || "Failed to analyze packaging label image.";
        const error = new Error(errorMsg);
        (error as Error & { code?: string }).code = data.code || "API_ERROR";
        throw error;
      }

      return data;
    } catch (error: unknown) {
      console.error("OCR Service Error:", error);
      throw error;
    }
  }

  /**
   * Compatibility wrapper for medicine validation
   */
  static async validateMedicineImage(file: File): Promise<{
    isValid: boolean;
    confidence: number;
    issues: string[];
    extracted?: ExtractedMedicineDetails;
    validation?: MedicineValidationResult;
  }> {
    try {
      const result = await this.processImage(file);
      const issues: string[] = [];

      if (result.validation) {
        result.validation.errors.forEach((err) => issues.push(err.message));
        result.validation.warnings.forEach((warn) => issues.push(warn.message));
        return {
          isValid: result.validation.isValid,
          confidence: typeof result.confidence === "number" ? result.confidence : 90,
          issues,
          extracted: result.extracted,
          validation: result.validation,
        };
      }
      
      if (result.tampered) issues.push("Potential label tampering or image blur detected");
      if (result.expired) issues.push("Medicine has expired");
      if (result.mismatch) issues.push("Expiry date mismatch detected");
      if (result.confidence && result.confidence < 60) issues.push("Low confidence in text recognition");

      const confidenceScore = result.confidence !== undefined 
        ? (result.confidence <= 1 ? result.confidence * 100 : result.confidence) 
        : 95;

      return {
        isValid: !result.tampered && !result.expired && !result.needs_review,
        confidence: confidenceScore,
        issues,
        extracted: result.extracted,
        validation: result.validation,
      };
    } catch (error: unknown) {
      return {
        isValid: false,
        confidence: 0,
        issues: [(error as Error).message || "Failed to process image"],
      };
    }
  }

  static async extractExpiryDate(file: File): Promise<Date | null> {
    try {
      const result = await this.processImage(file);
      const expiryStr = result.extracted?.expiryDate || result.expiry;
      return expiryStr ? new Date(expiryStr) : null;
    } catch {
      return null;
    }
  }

  static async extractMedicineName(file: File): Promise<string[]> {
    try {
      const result = await this.processImage(file);
      const name = result.extracted?.medicineName || result.medicine_name;
      return name ? [name] : [];
    } catch {
      return [];
    }
  }

  static async extractText(_imageUrl: string): Promise<{ text: string; confidence: number; words: string[] }> {
    return {
      text: "",
      confidence: 0,
      words: [],
    };
  }

  static async terminate(): Promise<void> {
    // No-op for Next.js API-based service
  }
}
