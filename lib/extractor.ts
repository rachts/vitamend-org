import { ExtractedMedicineDetails } from "@/types/medicine";

/**
 * Parses raw OCR text extracted from medicine packaging/labels
 * and structures it into standardized medicine properties.
 */
export function extractMedicineInfo(rawText: string): ExtractedMedicineDetails {
  if (!rawText || typeof rawText !== "string") {
    return {
      medicineName: null,
      dosage: null,
      batchNumber: null,
      expiryDate: null,
      manufacturer: null,
      mrp: null,
    };
  }

  const cleanLines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return {
    medicineName: parseMedicineName(cleanLines),
    dosage: parseDosage(rawText),
    batchNumber: parseBatchNumber(rawText),
    expiryDate: parseExpiryDate(rawText),
    manufacturer: parseManufacturer(cleanLines, rawText),
    mrp: parseMRP(rawText),
  };
}

function parseDosage(text: string): string | null {
  // Simplified dosage regex to prevent ReDoS
  const dosageRegex = /\b(\d+(?:\.\d+)?\s*(?:mg|mcg|µg|g|ml|iu))\b/i;
  const match = text.match(dosageRegex);
  return match && match[1] ? match[1].replace(/\s+/g, "").toUpperCase() : null;
}

function parseBatchNumber(text: string): string | null {
  // Strip out license numbers first so they are never confused for a batch number
  const sanitized = text.replace(/(?:MFG|MFD|MFR)\.?\s*(?:LIC(?:ENCE|ENSE)?|L|DL)\.?\s*(?:NO\.?)?\s*[:=.-]?\s*[A-Z0-9\-_/]+/gi, "");
  
  // Match Indian & international keywords: B.No., B. No., Batch:, Batch No, Lot No, BTH NO, BTH, LOT, BN, B.N. followed by alphanumeric code
  const batchRegex = /(?:BATCH(?: NO\.?| NUMBER|:)?|B\.? NO\.?|BTH\.?(?: NO\.?)?|LOT(?: NO\.?| NUMBER)?|L\.? NO\.?|BN)\s*[:=.-]?\s*([A-Z0-9\-_/]{2,18})/i;
  const match = sanitized.match(batchRegex);
  if (match && match[1]) {
    const candidate = match[1].trim();
    // Exclude accidental matches of dates, common words, or currency symbols
    if (candidate.length > 1 && !/^(DATE|ONLY|EXP|MFD|MFG|RS|INR|PRICE|BEFORE|LIC|NO|M|INDIA)$/i.test(candidate)) {
      return candidate.toUpperCase();
    }
  }

  // Fallback: Check lines starting with B:, Lot:, or Batch:
  const shortRegex = /\b(?:B|Lot|Batch)\s*[:=]\s*([A-Z0-9\-_/]{3,16})\b/i;
  const matchShort = sanitized.match(shortRegex);
  if (matchShort && matchShort[1]) {
    return matchShort[1].toUpperCase();
  }

  return null;
}

function parseExpiryDate(text: string): string | null {
  // Common Indian & standard keywords: Exp.:, Use before:, EXP, EXPIRY, EXP DATE, EXP. DT., USE BY, VALID UP TO, BEST BEFORE, E.D.
  const expKeywordRegex = /(?:EXP(?:IRY)?(?: DATE|:)?|USE BEFORE|BEST BEFORE|VALID UP TO)\s*[:=.-]?\s*(\b(?:0?[1-9]|1[0-2])[-/ .]+(?:202[0-9]|203[0-9]|[2-9][0-9])|\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[-/ .]+(?:202[0-9]|203[0-9]|[2-9][0-9]))/i;
  const match = text.match(expKeywordRegex);
  
  if (match && match[1]) {
    return normalizeDateString(match[1].trim());
  }

  // Fallback: If no explicit keyword match, look for standalone expiry patterns near dates like MFD / EXP
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (/(?:exp|use\s*before|best\s*before)/i.test(line)) {
      const dateRegex = /\b((?:0?[1-9]|1[0-2])[-/ .](?:202[0-9]|203[0-9]|[2-9][0-9])|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[-/ .]?(?:202[0-9]|203[0-9]))/i;
      const dateMatch = line.match(dateRegex);
      if (dateMatch && dateMatch[1]) {
        return normalizeDateString(dateMatch[1].trim());
      }
    }
  }

  return null;
}

function normalizeDateString(val: string): string {
  // Replaces dots or hyphens with slash for standard formatting, e.g. 11-2027 -> 11/2027
  let normalized = val.replace(/\s+/g, " ").replace(/[-.]/g, "/");
  // Expand 2-digit years to 4 digits if MM/YY
  const mmYyRegex = /^(\d{1,2})\/(\d{2})$/;
  const m = normalized.match(mmYyRegex);
  if (m && m[1] && m[2]) {
    const yr = Number.parseInt(m[2], 10);
    const fullYr = yr < 60 ? 2000 + yr : 1900 + yr;
    normalized = `${m[1].padStart(2, "0")}/${fullYr}`;
  }
  return normalized.toUpperCase();
}

function parseManufacturer(lines: string[], text: string): string | null {
  // Prominent Indian pharmaceutical giants recognition
  const indianPharmaRegex = /(?:Sun\s*Pharma(?:ceutical)?(?:\s*Laboratories)?|Cipla(?:\s*Healthcare)?|Dr\.?\s*Reddy['’]?s?(?:\s*Laboratories)?|Mankind(?:\s*Pharma)?|Torrent(?:\s*Pharmaceuticals)?|Lupin|Abbott(?:\s*India)?|Alkem(?:\s*Laboratories)?|Glenmark(?:\s*Pharmaceuticals)?|Zydus(?:\s*(?:Cadila|Healthcare))?|Intas(?:\s*Pharmaceuticals)?|Piramal|Biocon|Wockhardt|Macleods|Micro\s*Labs|Alembic|Emcure|Ipca|Aristo)(?:\s*(?:Pvt\.?|Ltd\.?|LLC|Inc\.?|GmbH|Co\.?|Limited))?\b/i;

  // Strip out "Mfg. Lic. No." / DL numbers first so they never falsely match as manufacturer names
  const cleanText = text.replace(/(?:MFG|MFD|MFR)\.?\s*(?:LIC(?:ENCE|ENSE)?|L|DL)\.?\s*(?:NO\.?)?\s*[:=.-]?\s*[^\r\n]+/gi, "");

  // 1. Look for explicit manufacturing keywords: Manufactured By, Mfd. By, Marketed By, Mkt By, Mfg By (with license excluded)
  const mfgKeywordRegex = /(?:MANUFACTURED(?: BY)?|MFD\.? BY|MFG\.? BY|MARKETED BY|PRODUCED BY|MFR\.? BY)\s*[:=.-]?\s*([^\r\n]+)/i;
  const match = cleanText.match(mfgKeywordRegex);
  
  if (match && match[1] && match[1].trim().length > 2) {
    let mfg = match[1].trim();
    if (!/^(?:LIC|DL|NO|INDIA|ESTD)/i.test(mfg)) {
      if (mfg.length < 5) {
        const idx = lines.findIndex((l) => l.includes(mfg));
        if (idx !== -1 && idx + 1 < lines.length && lines[idx + 1]) {
          const nextLine = lines[idx + 1] as string;
          if (!/BATCH|EXP|MFD|RS|PRICE|LIC/i.test(nextLine)) {
            mfg += " " + nextLine.trim();
          }
        }
      }
      return mfg.replace(/[,.;:]$/, "");
    }
  }

  // 2. Direct Indian pharmaceutical brand detection across lines
  for (const line of lines) {
    const pharmaMatch = line.match(indianPharmaRegex);
    if (pharmaMatch && !/BATCH|EXP|MRP|PRICE|LIC\.?\s*NO/i.test(line)) {
      return line.trim().replace(/[,.;:]$/, "");
    }
  }

  // 3. Fallback: Scan lines for general pharma industry suffixes
  for (const line of lines) {
    if (/(?:Pharma|Pharmaceuticals|Laboratories|Healthcare|Biotech|Life\s*Sciences|Industries)(?:\s*(?:Pvt\.?|Ltd\.?|LLC|Inc\.?|GmbH|Co\.?|Limited))?\b/i.test(line) && !/BATCH|EXP|MRP|PRICE|LIC\.?\s*NO/i.test(line)) {
      return line.trim().replace(/[,.;:]$/, "");
    }
  }

  return null;
}

function parseMRP(text: string): string | null {
  // Check specifically for Indian Rupees (Rs., INR, M.R.P. Rs., Incl. of all taxes)
  const rsRegex = /(?:MAX\.?\s*RETAIL\s*PRICE|M\.R\.P\.?|MRP|PRICE|RS\.?|INR)[^$\n\r]*?\b(?:RS\.?|INR)?\s*[:=.-]?\s*(?:RS\.?|INR)?\s*(\d+(?:\.\d{1,2})?)/i;
  const rsMatch = text.match(rsRegex);
  if (rsMatch && rsMatch[0] && rsMatch[1] && rsMatch[0].toLowerCase().match(/rs|inr|m\.?r\.?p/)) {
    return `Rs. ${Number.parseFloat(rsMatch[1]).toFixed(2)}`;
  }

  // General price fallback (USD / default $)
  const mrpRegex = /(?:MAX\.?\s*RETAIL\s*PRICE|M\.R\.P\.?|MRP|PRICE|\$)\s*[:=.-]?\s*\$?s*(\d+(?:\.\d{1,2})?)/i;
  const match = text.match(mrpRegex);
  if (match && match[1]) {
    return `$${Number.parseFloat(match[1]).toFixed(2)}`;
  }

  return null;
}

function parseMedicineName(lines: string[]): string | null {
  // Filter out noisy technical lines (batch, exp, mfd, mfg lic no, prices, addresses, instructions, Hindi/regional script noise)
  const candidateLines = lines.filter((line) => {
    const isNoisy = /^(?:BATCH|LOT|B\.NO|B\.?N\.?|EXP|MFD|MFG|MKT|MRP|PRICE|RS|INR|USE BEFORE|WARNING|CAUTION|FOR ORAL|RX ONLY|KEEP OUT|STORE IN|PLOT NO|INDUSTRIAL|REGD|LIC|DL NO)/i.test(line);
    const isTooShort = line.replace(/[^a-z0-9]/gi, "").length < 3;
    // Exclude lines with too high ratio of non-ASCII regional script characters when searching for English medicine brand name
    const asciiCount = (line.match(/[a-zA-Z]/g) || []).length;
    const totalCount = line.replace(/\s/g, "").length;
    const lowAsciiRatio = totalCount > 0 && (asciiCount / totalCount) < 0.4;
    return !isNoisy && !isTooShort && !lowAsciiRatio;
  });

  if (candidateLines.length === 0) {
    return null;
  }

  // Prefer the first prominent line that looks like a drug name (usually contains letters, possibly dosage)
  for (const line of candidateLines.slice(0, 4)) {
    const cleaned = line
      .replace(/^(?:Rx\s*Only\s*[-–—:]*|Tablets|Capsules|Injection|Syrup|Suspension|Ointment|Drops)\s*/i, "")
      .trim();

    if (cleaned.length >= 3 && /[a-zA-Z]{3,}/.test(cleaned)) {
      return cleaned;
    }
  }

  return candidateLines[0] || null;
}
