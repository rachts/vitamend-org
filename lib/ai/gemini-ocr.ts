import { GoogleGenerativeAI } from "@google/generative-ai";

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV === "production") {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || "dummy_key_for_test"
  );
};

export async function scanMedicineLabel(
  imageBuffer: Buffer,
  mimeType: string = "image/jpeg"
) {
  if (process.env.NODE_ENV === "test" || process.env.MOCK_OCR_MODE === "true" || (!process.env.GEMINI_API_KEY && process.env.NODE_ENV !== "production")) {
    const str = imageBuffer.toString("utf-8");
    if (str === "EMPTY" || str.includes("BLANK_LABEL")) {
      throw new Error("No text detected on the medicine label.");
    }
    if (str.includes("BLURRY_IMAGE_SIMULATION")) {
      throw new Error("The uploaded photo is blurred or too unclear to read accurately.");
    }
    const sampleExtracted = {
      medicineName: "AMOXICILLIN TRIHYDRATE CAPSULES 500mg",
      dosage: "500mg",
      batchNumber: "BTH-2025-889",
      expiryDate: "11/2027",
      manufacturer: "Sun Pharma Laboratories Ltd.",
      mrp: "Rs. 145.00",
      confidence: 96
    };
    const sampleRaw = `AMOXICILLIN TRIHYDRATE CAPSULES 500mg
Rx Only - For Oral Use
Batch No: BTH-2025-889
EXP DATE: 11/2027
MFD: 11/2024
Max. Retail Price Rs. 145.00 (Incl. of all taxes)
Manufactured by: Sun Pharma Laboratories Ltd.
Plot No. 44, Industrial Area, Mumbai 400001`;
    return {
      extracted: sampleExtracted,
      rawText: sampleRaw,
      confidence: sampleExtracted.confidence
    };
  }

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ 
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json", temperature: 0 }
  });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: mimeType
    }
  };

  const prompt = `
    You are a pharmaceutical OCR system.
    Analyze this medicine label image and 
    extract the following fields.
    
    Return ONLY a valid JSON object with 
    exactly these fields and no other text:
    
    {
      "medicineName": "extracted name or null",
      "dosage": "e.g. 500mg or null",
      "batchNumber": "batch/lot number or null",
      "expiryDate": "expiry date or null",
      "manufacturer": "company name or null",
      "mrp": "price if visible or null",
      "confidence": 0-100 number based on 
        how clearly you could read the label
    }
    
    For Indian medicine labels look for:
    - "Mfg." or "Mfd. by" for manufacturer
    - "B.No." or "Batch:" for batch number
    - "Exp." or "Use before" for expiry
    - "MRP" or "Rs." for price
    - Common formats: MM/YYYY or MMM YYYY
    
    If a field is not visible or unclear 
    return null for that field.
    Do not guess or hallucinate values.
    Only return the JSON object.
  `;

  const result = await model.generateContent(
    [prompt, imagePart]
  );
  
  const response = await result.response;
  const text = response.text();
  
  interface RawOcrExtracted {
    medicineName?: string | null;
    dosage?: string | null;
    batchNumber?: string | null;
    expiryDate?: string | null;
    manufacturer?: string | null;
    mrp?: string | null;
    confidence?: number | null;
  }

  let extracted: RawOcrExtracted;
  try {
    extracted = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        extracted = JSON.parse(match[0]);
      } catch {
        throw new Error("OCR returned unparseable output");
      }
    } else {
      throw new Error("OCR returned unparseable output");
    }
  }

  const rawText = [
    extracted.medicineName,
    extracted.batchNumber ? "Batch No: " + extracted.batchNumber : null,
    extracted.expiryDate ? "Exp: " + extracted.expiryDate : null,
    extracted.manufacturer,
    extracted.mrp,
  ]
    .filter(Boolean)
    .join("\n");
  
  return {
    extracted,
    rawText,
    confidence: typeof extracted.confidence === "number" ? extracted.confidence : 0
  };
}
