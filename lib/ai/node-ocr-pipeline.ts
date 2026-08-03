import { OCRCheckResponse } from "./ocr-service";
import { scanMedicineLabel } from "./gemini-ocr";

/**
 * Native OCR Pipeline using Google Gemini API
 * 
 * Stage 1: Image & Label Analysis via Gemini
 * Stage 2: Intelligent Parsing & Validation
 */
export async function processImageWithNodeOCR(imageBuffer: Buffer, mimeType: string = "image/jpeg"): Promise<OCRCheckResponse> {
  const result = await scanMedicineLabel(
    imageBuffer, 
    mimeType
  );

  const text = result.rawText || "";
  const confidence = result.confidence;

  // Stage 3: Intelligent Parsing
  const parsedData = parseText(text);

  if (result.extracted) {
    if (result.extracted.medicineName) parsedData.medicineName = result.extracted.medicineName;
    if (result.extracted.batchNumber) parsedData.batch = result.extracted.batchNumber;
    if (result.extracted.expiryDate) parsedData.exp = result.extracted.expiryDate;
  }

  // 4. Accuracy Boost Techniques / Heuristic Rules
  let expired = false;
  const tampered = false;
  let needs_review = false;
  const mismatch = false;

  if (parsedData.exp) {
    const expDate = parseDate(parsedData.exp);
    if (expDate && expDate < new Date()) {
      expired = true;
    }
    
    if (parsedData.mfg) {
      const mfgDate = parseDate(parsedData.mfg);
      if (mfgDate && expDate && mfgDate > expDate) {
        // OCR error: MFG > EXP
        needs_review = true;
      }
    }
  } else {
    needs_review = true; // Expiry not found
  }

  const normalizedConfidence = confidence > 1 ? confidence / 100 : confidence;
  if (normalizedConfidence < 0.6) {
    needs_review = true;
  }

  return {
    success: true,
    expiry: parsedData.exp,
    batch: parsedData.batch,
    medicine_name: parsedData.medicineName,
    qr_expiry: null, // Custom parsing does not currently handle QR
    expired,
    tampered, // No logic yet to detect tamper purely from text, defaults false
    confidence: normalizedConfidence,
    needs_review,
    mismatch,
    raw_text: text,
  } as OCRCheckResponse;
}

function parseText(text: string) {
  // Strip out license numbers so they are never misidentified as batch or manufacturer
  const sanitized = text.replace(/(?:MFG|MFD|MFR)\.?\s*(?:LIC(?:ENCE|ENSE)?|L|DL)\.?\s*(?:NO\.?)?\s*[:=.-]?\s*[A-Z0-9\-_/]+/gi, "");

  const batchRegex = /(?:BATCH(?:\s*NO\.?|\s*NUMBER|:)|\bB\.?\s*NO\.?|\bB\.?\s*N\.?|\bBTH\.?(?:\s*NO\.?)?|\bLOT(?:\s*NO\.?|\s*NUMBER)?|\bL\.?\s*NO\.?|\bBN)\s*[:=.-]?\s*([A-Z0-9\-_/]{2,18})/i;
  const mfgRegex = /(?:MANUFACTURED\s*(?:IN\s*INDIA\s*)?(?:BY|IN)|MFD\.?\s*(?:BY|IN)|MFG\.?\s*BY|MARKETED\s*BY|MKT\.?\s*BY)\s*[:=.-]?\s*([^\r\n]+)/i;
  const expRegex = /(?:EXP(?:IRY)?(?:\s*(?:DATE|DT|D\.?|:))?|USE\s*(?:BEFORE|BY)|BEST\s*BEFORE|VALID\s*(?:UP\s*TO|UNTO))\s*[:=.-]?\s*(\d{2}[\/\-.]\d{2,4}|\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[\s\/\-.0-9]{3,8})/i;
  
  // Fallback regex for dates
  const fallbackDateRegex = /\b(?:0?[1-9]|1[0-2])[-/ .](?:202[0-9]|203[0-9]|[2-9][0-9])|\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s*(?:202[0-9]|203[0-9])/gi;

  let exp = text.match(expRegex)?.[1] || null;
  if (!exp) {
    const dates = text.match(fallbackDateRegex);
    if (dates && dates.length > 0) {
      const lastDate = dates[dates.length - 1];
      if (lastDate) {
        exp = lastDate.replace(/[-.]/g, '/'); // Assume last matched date is expiry
      }
    }
  }

  let batch = sanitized.match(batchRegex)?.[1] || null;
  if (!batch) {
    const shortBatch = sanitized.match(/\b(?:B|Lot|Batch)\s*[:=]\s*([A-Z0-9\-_/]{3,16})\b/i);
    batch = shortBatch?.[1] || null;
  }

  return {
    batch: batch ? batch.trim().toUpperCase() : null,
    mfg: sanitized.match(mfgRegex)?.[1]?.trim().replace(/[,.;:]$/, "") || null,
    exp: exp ? exp.toUpperCase() : null,
    medicineName: extractMedicineName(text),
  };
}

function extractMedicineName(text: string): string | null {
  const stopWords = ["tablet", "tablets", "capsule", "capsules", "mg", "ml", "syrup", "batch", "exp", "mfg", "price", "mrp", "rs", "inr", "use before", "keep out", "for oral", "lic no", "dl no", "only"];
  
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 3) 
    .filter(line => !/^\d+$/.test(line)) 
    .filter(line => {
      const lower = line.toLowerCase();
      return !stopWords.some(word => lower.includes(word));
    })
    .filter(line => {
      // Exclude lines with regional scripts or noise by checking ASCII character ratio
      const asciiCount = (line.match(/[a-zA-Z]/g) || []).length;
      const totalCount = line.replace(/\s/g, "").length;
      return totalCount === 0 || (asciiCount / totalCount) >= 0.4;
    });

  lines.sort((a, b) => b.length - a.length);
  
  if (lines.length > 0) {
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const candidate = lines[i];
      if (!candidate) continue;
      // Filtering out purely alphabetic/numeric gibberish strings
      if (candidate.split(' ').length < 5 && /[a-zA-Z]{3,}/.test(candidate)) {
        return candidate;
      }
    }
    return lines[0] || null; 
  }

  return null;
}

function parseDate(dateStr: string): Date | null {
  try {
    const normalized = dateStr.replace(/-/g, '/');
    const parts = normalized.split('/');
    if (parts.length === 3) {
      let year = parseInt(parts[2] as string, 10);
      if (year < 100) year += 2000;
      return new Date(year, parseInt(parts[1] as string, 10) - 1, parseInt(parts[0] as string, 10));
    } else if (parts.length === 2) {
      let year = parseInt(parts[1] as string, 10);
      if (year < 100) year += 2000;
      return new Date(year, parseInt(parts[0] as string, 10) - 1, 1);
    } else if (/[a-zA-Z]{3}\s\d{4}/.test(normalized)) {
      return new Date(normalized);
    }
  } catch {
    return null;
  }
  return null;
}
