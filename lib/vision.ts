import { logger } from "@/lib/logger";
import { VisionExtractionResult, OCRErrorCode } from "@/types/medicine";
import { scanMedicineLabel } from "@/lib/ai/gemini-ocr";

export class VisionServiceError extends Error {
  code: OCRErrorCode;

  constructor(message: string, code: OCRErrorCode) {
    super(message);
    this.name = "VisionServiceError";
    this.code = code;
  }
}

/**
 * Analyzes an image buffer using Google Gemini API (replacing legacy Cloud Vision API).
 * Computes average confidence and detects potential image blur or unreadable packaging.
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string = "image/jpeg"): Promise<VisionExtractionResult> {
  try {
    const result = await scanMedicineLabel(buffer, mimeType);
    const text = result.rawText || "";
    const confidencePercentage = typeof result.confidence === "number" ? result.confidence : 85;

    if (!text || text.trim().length === 0) {
      throw new VisionServiceError(
        "No text detected on the medicine label. Please upload a clear photo of the medicine packaging or label.",
        "NO_TEXT_DETECTED"
      );
    }

    const isBlurred = confidencePercentage < 60;

    if (confidencePercentage < 40) {
      throw new VisionServiceError("Image is too blurred to read accurately.", "BLURRED_IMAGE");
    }
    
    if (confidencePercentage < 50) {
      throw new VisionServiceError("Low OCR confidence. Please retake photo.", "LOW_CONFIDENCE");
    }

    return {
      text,
      confidence: Math.max(1, Math.min(100, confidencePercentage)),
      isBlurred,
    };
  } catch (error: unknown) {
    if (error instanceof VisionServiceError) {
      throw error;
    }
    if (error instanceof Error && error.message?.includes("No text detected")) {
      throw new VisionServiceError(error.message, "NO_TEXT_DETECTED");
    }
    if (error instanceof Error && (error.message?.includes("blurred") || error.message?.includes("unclear"))) {
      throw new VisionServiceError(error.message, "BLURRED_IMAGE");
    }
    logger.error("Gemini OCR Processing Error:", error);
    throw new VisionServiceError(
      "Failed to communicate with OCR Engine: " + (error instanceof Error ? error.message : "Unknown error"),
      "API_ERROR"
    );
  }
}
