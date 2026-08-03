import { ExtractedMedicineDetails, MedicineValidationResult, ValidationFieldError } from "@/types/medicine";
import { isBefore, addMonths, endOfMonth, isValid as isValidDate } from "date-fns";

/**
 * Validates extracted or user-edited medicine details against CDSCO safety standards
 * and standard pharmaceutical distribution rules.
 */
export function validateMedicineDetails(details: ExtractedMedicineDetails): MedicineValidationResult {
  const errors: ValidationFieldError[] = [];
  const warnings: ValidationFieldError[] = [];

  let expiryValid = false;
  let batchValid = false;
  let hasRequiredFields = false;

  // 1. Check required primary identifiers (Medicine Name)
  if (!details.medicineName || details.medicineName.trim().length === 0) {
    errors.push({
      field: "medicineName",
      message: "Medicine name is required for regulatory tracking and safety matching.",
      severity: "error",
    });
  } else if (details.medicineName.trim().length < 3) {
    warnings.push({
      field: "medicineName",
      message: "Medicine name seems unusually short. Please verify accuracy.",
      severity: "warning",
    });
  }

  // 2. Validate Batch Number format
  if (!details.batchNumber || details.batchNumber.trim().length === 0) {
    errors.push({
      field: "batchNumber",
      message: "No batch number found on label photo. Please check packaging box and input lot number manually for recall auditing.",
      severity: "error",
    });
  } else {
    const batch = details.batchNumber.trim();
    // Typical batch number check: at least 2 alphanumeric characters, no invalid symbols
    if (batch.length < 2) {
      errors.push({
        field: "batchNumber",
        message: "Batch number must contain at least 2 characters.",
        severity: "error",
      });
    } else if (!/^[A-Z0-9\-_/]+$/i.test(batch)) {
      warnings.push({
        field: "batchNumber",
        message: "Batch number contains non-standard characters. Confirm against packaging.",
        severity: "warning",
      });
      batchValid = true; // allow with warning
    } else {
      batchValid = true;
    }
  }

  // 3. Validate Expiry Date & Expiration status
  if (!details.expiryDate || details.expiryDate.trim().length === 0) {
    errors.push({
      field: "expiryDate",
      message: "Expiration date is required to ensure treatment potency and patient safety.",
      severity: "error",
    });
  } else {
    const parsedDate = parseExpiryToDate(details.expiryDate.trim());
    if (!parsedDate || !isValidDate(parsedDate)) {
      errors.push({
        field: "expiryDate",
        message: "Expiry date could not be parsed automatically from label photo. Please verify physical packaging and enter manually (MM/YYYY).",
        severity: "error",
      });
    } else {
      const now = new Date();
      // Expiry is valid up to the last day of the expiration month
      const expirationEnd = endOfMonth(parsedDate);

      if (isBefore(expirationEnd, now)) {
        errors.push({
          field: "expiryDate",
          message: "Medicine has already expired and cannot be legally distributed or consumed.",
          severity: "error",
        });
      } else {
        expiryValid = true;
        // Warn when medicine expires within 90 days
        const ninetyDaysFromNow = addMonths(now, 3);
        if (isBefore(expirationEnd, ninetyDaysFromNow)) {
          warnings.push({
            field: "expiryDate",
            message: "Medicine expires within 90 days. Priority emergency clinic distribution routing will be engaged automatically.",
            severity: "warning",
          });
        }
      }
    }
  }

  // 4. Check secondary fields (Dosage & Manufacturer)
  if (!details.dosage || details.dosage.trim().length === 0) {
    warnings.push({
      field: "dosage",
      message: "Dosage (e.g., 500mg, 10mg) not explicitly verified. Ensure correct strength is noted.",
      severity: "warning",
    });
  }

  if (!details.manufacturer || details.manufacturer.trim().length === 0) {
    warnings.push({
      field: "manufacturer",
      message: "Manufacturer name was not detected from label photo. Verify original sealed packaging.",
      severity: "warning",
    });
  }

  hasRequiredFields = Boolean(
    details.medicineName &&
    details.medicineName.trim().length > 0 &&
    details.expiryDate &&
    details.expiryDate.trim().length > 0 &&
    details.batchNumber &&
    details.batchNumber.trim().length > 0
  );

  const isValid = errors.length === 0 && hasRequiredFields && expiryValid && batchValid;
  
  let summary = "Medicine is verified safe and eligible for dispensary intake.";
  if (!isValid) {
    summary = errors.length > 0 ? `Safety validation failed: ${errors[0]?.message}` : "Required mandatory details are missing.";
  } else if (warnings.length > 0) {
    summary = `Verified with advisory warnings: ${warnings[0]?.message}`;
  }

  return {
    isValid,
    errors,
    warnings,
    hasRequiredFields,
    expiryValid,
    batchValid,
    summary,
  };
}

/**
 * Parses multiple standard pharmaceutical date representation strings into a JavaScript Date object
 */
export function parseExpiryToDate(dateStr: string): Date | null {
  const cleaned = dateStr.replace(/[-.]/g, "/").trim();

  // 1. Format: MM/YYYY (e.g. 11/2027)
  let m = cleaned.match(/^(\d{1,2})\/(\d{4})$/);
  if (m && m[1] && m[2]) {
    const month = Number.parseInt(m[1], 10);
    const year = Number.parseInt(m[2], 10);
    if (month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
      return new Date(year, month - 1, 15);
    }
  }

  // 2. Format: DD/MM/YYYY (e.g. 31/12/2026 or 15/08/2025)
  m = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m && m[1] && m[2] && m[3]) {
    const day = Number.parseInt(m[1], 10);
    const month = Number.parseInt(m[2], 10);
    const year = Number.parseInt(m[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
      return new Date(year, month - 1, day);
    }
  }

  // 3. Format: MM/YY (e.g. 11/27)
  m = cleaned.match(/^(\d{1,2})\/(\d{2})$/);
  if (m && m[1] && m[2]) {
    const month = Number.parseInt(m[1], 10);
    const yr = Number.parseInt(m[2], 10);
    const fullYear = yr < 60 ? 2000 + yr : 1900 + yr;
    if (month >= 1 && month <= 12 && fullYear >= 2000 && fullYear <= 2100) {
      return new Date(fullYear, month - 1, 15);
    }
  }

  // 4. Format: YYYY/MM or YYYY-MM (e.g. 2027/11)
  m = cleaned.match(/^(\d{4})\/(\d{1,2})$/);
  if (m && m[1] && m[2]) {
    const year = Number.parseInt(m[1], 10);
    const month = Number.parseInt(m[2], 10);
    if (month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
      return new Date(year, month - 1, 15);
    }
  }

  // 5. Format: Month Name Year (e.g. NOV 2027, NOVEMBER 2027, NOV/2027)
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  m = cleaned.toUpperCase().match(/^([A-Z]{3})[A-Z]*\s*\/?\s*(\d{4})$/);
  if (m && m[1] && m[2]) {
    const monthPrefix = m[1];
    const monthIdx = monthNames.indexOf(monthPrefix);
    const year = Number.parseInt(m[2], 10);
    if (monthIdx !== -1 && year >= 2000 && year <= 2100) {
      return new Date(year, monthIdx, 15);
    }
  }

  // Try standard Date.parse fallback
  const fallback = new Date(cleaned);
  return isValidDate(fallback) && fallback.getFullYear() > 1900 ? fallback : null;
}
