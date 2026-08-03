export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { extractTextFromBuffer, VisionServiceError } from "@/lib/vision";
import { extractMedicineInfo } from "@/lib/extractor";
import { validateMedicineDetails } from "@/lib/validator";
import { getDemoOCRResponse } from "@/lib/services/ocr-demo";
import { OCRApiResponse, OCRErrorCode } from "@/types/medicine";

const limiter = rateLimit(10, 1);

const SUPPORTED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const rateLimitResult = await limiter(req);
  if (!rateLimitResult.allowed) {
    const errorResponse: OCRApiResponse = {
      success: false,
      error: "Too many scan requests. Please wait before scanning again.",
      code: "API_ERROR",
    };
    return NextResponse.json(errorResponse, { status: 429 });
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
    
    const lowerName = file.name.toLowerCase();


    // Offline / Demo Fallback Mode
    const demoResponse = getDemoOCRResponse(lowerName, startTime);
    if (demoResponse) {
      logger.info(`[DEMO_MODE/Label Match] Returning instant high-confidence pre-recorded OCR response for ${file.name}`);
      return NextResponse.json(demoResponse, { status: 200 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 1: Send image buffer to Google Gemini OCR Engine
    const visionResult = await extractTextFromBuffer(buffer, file.type || "image/jpeg");

    // Step 2: Extract structural medicine details from OCR text
    const extracted = extractMedicineInfo(visionResult.text);

    // Step 3: Validate extracted medicine details against regulatory rules
    const validation = validateMedicineDetails(extracted);

    if (visionResult.confidence < 80) {
      validation.warnings.push({
        field: "confidence",
        message: `OCR detection confidence is below 80% (${visionResult.confidence}%). Please carefully review and confirm all numbers against the physical box or label.`,
        severity: "warning",
      });
    }

    if (visionResult.isBlurred) {
      validation.warnings.push({
        field: "image",
        message: "Image quality appears slightly degraded or blurry. Consider taking a clearer photo in stable lighting or check characters manually.",
        severity: "warning",
      });
    }

    const processingTimeMs = Date.now() - startTime;
    logger.info(`OCR completed successfully in ${processingTimeMs}ms (Confidence: ${visionResult.confidence}%, Valid: ${validation.isValid})`);

    // Step 4: Construct standard response with backward-compatibility properties
    const responseData: OCRApiResponse = {
      success: true,
      extracted,
      validation,
      confidence: visionResult.confidence,
      rawText: visionResult.text,
      processingTimeMs,
      // Backward compatibility fields for legacy clients
      expiry: extracted.expiryDate,
      batch: extracted.batchNumber,
      medicine_name: extracted.medicineName,
      qr_expiry: null,
      expired: !validation.expiryValid,
      tampered: visionResult.isBlurred || visionResult.confidence < 60,
      needs_review: !validation.isValid || visionResult.confidence < 80,
      mismatch: false,
      raw_text: visionResult.text,
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error: unknown) {
    const processingTimeMs = Date.now() - startTime;
    const message = error instanceof Error ? (error as Error).message : "Unknown error";
    logger.error("OCR Route Processing Error:", message);

    if (error instanceof VisionServiceError) {
      const statusCode = 
        error.code === "NO_TEXT_DETECTED" || error.code === "BLURRED_IMAGE" || error.code === "LOW_CONFIDENCE" ? 422 : 500;
      
      const errResponse: OCRApiResponse = {
        success: false,
        error: message,
        code: error.code as OCRErrorCode,
        processingTimeMs,
      };
      return NextResponse.json(errResponse, { status: statusCode });
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
