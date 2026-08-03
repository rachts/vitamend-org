export interface ExtractedMedicineDetails {
  medicineName: string | null;
  dosage: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  manufacturer: string | null;
  mrp: string | null;
}

export interface ValidationFieldError {
  field: keyof ExtractedMedicineDetails | "general" | "confidence" | "image";
  message: string;
  severity: "error" | "warning";
}

export interface MedicineValidationResult {
  isValid: boolean;
  errors: ValidationFieldError[];
  warnings: ValidationFieldError[];
  hasRequiredFields: boolean;
  expiryValid: boolean;
  batchValid: boolean;
  summary: string;
}

export type OCRErrorCode =
  | "LOW_CONFIDENCE"
  | "BLURRED_IMAGE"
  | "NO_TEXT_DETECTED"
  | "UNSUPPORTED_FILE"
  | "LARGE_FILE"
  | "API_ERROR"
  | "INVALID_REQUEST";

export interface OCRApiResponse {
  success: boolean;
  extracted?: ExtractedMedicineDetails;
  validation?: MedicineValidationResult;
  confidence?: number; // 0 - 100 percentage
  rawText?: string;
  processingTimeMs?: number;
  error?: string;
  code?: OCRErrorCode;
  isDemoMode?: boolean;
  daysUntilExpiry?: number;

  /** @deprecated Legacy field. Use extracted.expiryDate instead */
  expiry?: string | null;
  /** @deprecated Legacy field. Use extracted.batchNumber instead */
  batch?: string | null;
  /** @deprecated Legacy field. Use extracted.medicineName instead */
  medicine_name?: string | null;
  /** @deprecated Legacy field */
  qr_expiry?: null;
  /** @deprecated Legacy field */
  expired?: boolean;
  /** @deprecated Legacy field */
  tampered?: boolean;
  /** @deprecated Legacy field */
  needs_review?: boolean;
  /** @deprecated Legacy field */
  mismatch?: boolean;
  /** @deprecated Legacy field. Use rawText instead */
  raw_text?: string;
}

export interface VisionExtractionResult {
  text: string;
  confidence: number;
  isBlurred: boolean;
}
