export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { extractMedicineInfo } from "@/lib/extractor";
import { validateMedicineDetails } from "@/lib/validator";
import { scanMedicineLabel } from "@/lib/ai/gemini-ocr";
import { OCRApiResponse } from "@/types/medicine";

const SUPPORTED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const limit = await rateLimit(req);
  if (!limit.success) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
  }

  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      const errorResponse: OCRApiResponse = {
        success: false,
        error: "Invalid multipart/form-data payload format.",
        code: "INVALID_REQUEST",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Support both 'image' (per new production requirement) and 'file' (legacy compat)
    const file = (formData.get("image") || formData.get("file")) as File | null;

    if (!file) {
      const errorResponse: OCRApiResponse = {
        success: false,
        error: "No packaging photo found. Please attach an image file under the 'image' field.",
        code: "INVALID_REQUEST",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const errorResponse: OCRApiResponse = {
        success: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowance of 10 MB.`,
        code: "LARGE_FILE",
      };
      return NextResponse.json(errorResponse, { status: 413 });
    }

    // Validate image format (JPG, PNG, WEBP, PDF)
    if (!file.type || !SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase())) {
      const errorResponse: OCRApiResponse = {
        success: false,
        error: `Unsupported image format (${file.type || "unknown"}). Supported formats are: JPG, JPEG, PNG, WEBP, PDF.`,
        code: "UNSUPPORTED_FILE",
      };
      return NextResponse.json(errorResponse, { status: 415 });
    }

    logger.info(`Processing OCR request for file: ${file.name} (${file.size} bytes, ${file.type})`);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 1: Send image buffer to Google Gemini OCR Engine with timeout
    const ocrPromise = scanMedicineLabel(buffer, file.type || "image/jpeg");
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("OCR_TIMEOUT")), 15000)
    );
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const visionResult: any = await Promise.race([ocrPromise, timeoutPromise]);
    
    // Markdown-parsing logic for Gemini responses (if it returns markdown instead of JSON)
    if (visionResult.rawText) {
       visionResult.rawText = visionResult.rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    if (!visionResult.rawText || visionResult.rawText.trim().length === 0) {
      const errResponse: OCRApiResponse = {
        success: false,
        error: "No text detected on the medicine label. Please upload a clear photo of the medicine packaging or label.",
        code: "NO_TEXT_DETECTED",
        processingTimeMs: Date.now() - startTime,
      };
      return NextResponse.json(errResponse, { status: 422 });
    }

    const confidencePercentage = typeof visionResult.confidence === "number" ? visionResult.confidence : 85;
    const isBlurred = confidencePercentage < 60;

    if (confidencePercentage < 40) {
      const errResponse: OCRApiResponse = {
        success: false,
        error: "Image is too blurred to read accurately.",
        code: "BLURRED_IMAGE",
        processingTimeMs: Date.now() - startTime,
      };
      return NextResponse.json(errResponse, { status: 422 });
    }

    if (confidencePercentage < 50) {
      const errResponse: OCRApiResponse = {
        success: false,
        error: "Low OCR confidence. Please retake photo.",
        code: "LOW_CONFIDENCE",
        processingTimeMs: Date.now() - startTime,
      };
      return NextResponse.json(errResponse, { status: 422 });
    }

    // Step 2: Extract structural medicine details from OCR text
    const extracted = extractMedicineInfo(visionResult.rawText);

    // Step 3: Validate extracted medicine details against regulatory rules
    const validation = validateMedicineDetails(extracted);

    if (confidencePercentage < 80) {
      validation.warnings.push({
        field: "confidence",
        message: `OCR detection confidence is below 80% (${confidencePercentage}%). Please carefully review and confirm all numbers against the physical box or label.`,
        severity: "warning",
      });
    }

    if (isBlurred) {
      validation.warnings.push({
        field: "image",
        message: "Image quality appears slightly degraded or blurry. Consider taking a clearer photo in stable lighting or check characters manually.",
        severity: "warning",
      });
    }

    const processingTimeMs = Date.now() - startTime;
    logger.info(`OCR completed successfully in ${processingTimeMs}ms (Confidence: ${confidencePercentage}%, Valid: ${validation.isValid})`);

    // Step 4: Construct standard response with backward-compatibility properties
    const responseData: OCRApiResponse = {
      success: true,
      extracted,
      validation,
      confidence: confidencePercentage,
      rawText: visionResult.rawText,
      processingTimeMs,
      // Backward compatibility fields for legacy clients
      expiry: extracted.expiryDate,
      batch: extracted.batchNumber,
      medicine_name: extracted.medicineName,
      qr_expiry: null,
      expired: !validation.expiryValid,
      tampered: isBlurred || confidencePercentage < 60,
      needs_review: !validation.isValid || confidencePercentage < 80,
      mismatch: false,
      raw_text: visionResult.rawText,
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error: unknown) {
    const processingTimeMs = Date.now() - startTime;
    const message = error instanceof Error ? (error as Error).message : "Unknown error";
    logger.error("OCR Route Processing Error:", message);

    if (message === "OCR_TIMEOUT") {
      const errResponse: OCRApiResponse = {
        success: false,
        error: "OCR scanning timed out. The label might be too complex or the service is busy.",
        code: "API_ERROR",
        processingTimeMs,
      };
      return NextResponse.json(errResponse, { status: 504 });
    }

    if (message.includes("blurred") || message.includes("unclear") || message.includes("BLURRY")) {
      const errResponse: OCRApiResponse = {
        success: false,
        error: "Image is too blurred to read accurately.",
        code: "BLURRED_IMAGE",
        processingTimeMs,
      };
      return NextResponse.json(errResponse, { status: 422 });
    }

    if (message.includes("No text detected")) {
      const errResponse: OCRApiResponse = {
        success: false,
        error: "No text detected on the medicine label. Please upload a clear photo of the medicine packaging or label.",
        code: "NO_TEXT_DETECTED",
        processingTimeMs,
      };
      return NextResponse.json(errResponse, { status: 422 });
    }

    const errResponse: OCRApiResponse = {
      success: false,
      error: "An unexpected error occurred while processing the scan. Please try again.",
      code: "API_ERROR",
      processingTimeMs,
    };
    return NextResponse.json(errResponse, { status: 500 });
  }
}
