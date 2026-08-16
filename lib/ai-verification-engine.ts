import { GoogleGenerativeAI } from "@google/generative-ai";
import { VerificationLog } from "@/models/VerificationLog";
import { Medicine } from "@/models/Medicine";
import { notifyReviewers } from "./notifications";
import { z } from "zod";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "disabled_key";
const genAI = new GoogleGenerativeAI(apiKey);

interface AICheckResult {
  isTampered: boolean;
  tamperConfidence: number;
  isRecalled: boolean;
  recallReason: string;
  aiReasoning: string;
}

interface DBCheckResult {
  isDuplicate: boolean;
  isExpired: boolean;
  duplicateMatches: number;
}

interface DecisionResult {
  confidence: number;
  decision: "approved" | "rejected" | "under_review";
  reasoning: string;
}

export async function runVerificationPipeline(medicineId: string, base64Images: { data: string; mimeType: string }[]) {
  const logs: unknown[] = [];
  
  const logStage = async (stage: string, status: "success" | "warning" | "failure", details: unknown, confidence?: number) => {
    const log = await VerificationLog.create({
      medicineId,
      stage,
      status,
      details,
      confidence,
    });
    logs.push(log);
  };

  try {
    const med = await Medicine.findById(medicineId);
    if (!med) throw new Error("Medicine record not found");

    // Convert images to Gemini InlineData format
    const imageParts = base64Images.map((img) => ({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType,
      },
    }));

    // STAGE 1: OCR (Gemini 1.5 Flash Vision)
    let ocrResult: z.infer<typeof OcrResultSchema>;
    const OcrResultSchema = z.object({
      name: z.string().optional(),
      genericName: z.string().optional(),
      dosage: z.string().optional(),
      batchNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      manufacturer: z.string().optional(),
      qrCode: z.string().optional(),
      confidence: z.number().min(0).max(100),
    });

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze these medicine images and extract: name, genericName, dosage, batchNumber, expiryDate (ISO YYYY-MM-DD), manufacturer, qrCode. Return strict JSON only without markdown formatting. Include a 'confidence' field between 0-100 indicating how clear the text is.`;
      
      const result = await model.generateContent([prompt, ...imageParts]);
      // Gemini 1.5 Flash occasionally wraps JSON in markdown code blocks despite the prompt asking for raw JSON.
      const text = result.response.text().replace(/```json|```/g, "").trim();
      try {
        ocrResult = OcrResultSchema.parse(JSON.parse(text));
      } catch {
        // Fallback: try to extract JSON object via regex if there's trailing conversational text
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          ocrResult = OcrResultSchema.parse(JSON.parse(match[0]));
        } else {
          throw new Error("Could not parse JSON from AI response.");
        }
      }

      await logStage("ocr", "success", ocrResult, ocrResult.confidence);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      await logStage("ocr", "failure", { error: msg });
      throw new Error("OCR Stage failed: Invalid AI response format");
    }

    // STAGE 2: AI Verification (Gemini 1.5 Flash)
    let aiCheckResult: AICheckResult;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze these images for tampering signs (broken seals, discoloration, mismatched labels, water damage, re-glued packaging). Also, check if the medicine '${ocrResult.name}' by '${ocrResult.manufacturer}' is known to be part of any recent FDA/global recalled batches. Return strict JSON only with fields: isTampered (boolean), tamperConfidence (number 0-100), isRecalled (boolean), recallReason (string or null), aiReasoning (string explanation).`;
      
      const result = await model.generateContent([prompt, ...imageParts]);
      const text = result.response.text().replace(/```json|```/g, "").trim();
      try {
        aiCheckResult = JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          aiCheckResult = JSON.parse(match[0]);
        } else {
          throw new Error("Could not parse JSON from AI response.");
        }
      }

      const status = aiCheckResult.isTampered || aiCheckResult.isRecalled ? "warning" : "success";
      await logStage("ai_check", status, aiCheckResult, aiCheckResult.tamperConfidence);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      await logStage("ai_check", "failure", { error: msg });
      throw new Error("AI Verification Stage failed");
    }

    // STAGE 3: Database Cross-Check
    let dbCheckResult: DBCheckResult;
    try {
      const parsedExpiry = new Date(ocrResult.expiryDate || Date.now());
      if (isNaN(parsedExpiry.getTime())) {
        await logStage("db_check", "failure", { error: "Invalid expiry date from OCR", rawValue: ocrResult.expiryDate });
        throw new Error("DB Check Stage failed: Could not parse expiry date");
      }

      const isExpired = parsedExpiry < new Date();

      // Check Duplicates in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch all recent medicines to perform Levenshtein distance check in-memory
      const recentMeds = await Medicine.find({
        _id: { $ne: medicineId },
        createdAt: { $gte: thirtyDaysAgo },
        status: { $in: ["pending", "under_review", "approved"] },
      }).lean();

      const levenshteinDistance = (s: string, t: string) => {
        if (!s.length) return t.length;
        if (!t.length) return s.length;
        const arr = [];
        for (let i = 0; i <= t.length; i++) {
          arr[i] = [i];
          for (let j = 1; j <= s.length; j++) {
            arr[i][j] =
              i === 0
                ? j
                : Math.min(
                    arr[i - 1][j] + 1,
                    arr[i][j - 1] + 1,
                    arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
                  );
          }
        }
        return arr[t.length][s.length];
      };

      const threshold = 3; // Max distance to be considered a duplicate
      const targetName = (ocrResult.name || "").toLowerCase();
      const targetBatch = (ocrResult.batchNumber || "").toLowerCase();

      let duplicates = 0;
      for (const m of recentMeds) {
        const nameDist = levenshteinDistance(m.name.toLowerCase(), targetName);
        const batchDist = levenshteinDistance((m.batchNumber || "").toLowerCase(), targetBatch);
        const maxLen = Math.max(m.name.length, targetName.length);
        const isSimilar = nameDist <= threshold || (maxLen > 5 && nameDist / maxLen < 0.2);
        if (isSimilar && batchDist <= threshold) {
          duplicates++;
        }
      }

      const isDuplicate = duplicates > 0;

      dbCheckResult = {
        isExpired,
        isDuplicate,
        duplicateMatches: duplicates,
      };

      const status = isExpired || isDuplicate ? "warning" : "success";
      await logStage("db_check", status, dbCheckResult);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      await logStage("db_check", "failure", { error: msg });
      throw new Error("DB Check Stage failed");
    }

    // STAGE 4: Decision Engine
    let decisionResult: DecisionResult;
    try {
      let finalConfidence = ocrResult.confidence;
      let reasoning = "";

      // We use a threshold-based logic instead of naive point deduction (-40, -50).
      // Any critical safety check failure is an automatic rejection.
      const isCriticalFailure = aiCheckResult.isTampered || aiCheckResult.isRecalled || dbCheckResult.isExpired;
      
      if (aiCheckResult.isTampered) reasoning += "Safety Check Failed: Tampering detected. ";
      if (aiCheckResult.isRecalled) reasoning += "Safety Check Failed: Recalled batch. ";
      if (dbCheckResult.isExpired) reasoning += "Safety Check Failed: Medicine is expired. ";
      
      if (dbCheckResult.isDuplicate) {
        finalConfidence = Math.max(0, finalConfidence - 20); // Minor penalty
        reasoning += "Warning: Duplicate batch submitted recently. ";
      }

      let decision: "approved" | "rejected" | "under_review" = "under_review";
      
      if (isCriticalFailure) {
        decision = "rejected";
        reasoning += "Decision: Rejected (Critical safety failure).";
      } else if (finalConfidence >= 80 && !dbCheckResult.isDuplicate) {
        decision = "approved";
        reasoning += "Decision: Approved (Meets all safety criteria).";
      } else {
        decision = "under_review";
        reasoning += "Decision: Under Review (Requires manual inspection).";
      }

      decisionResult = {
        confidence: finalConfidence,
        decision,
        reasoning: reasoning.trim(),
      };

      await logStage("decision", "success", decisionResult, finalConfidence);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      await logStage("decision", "failure", { error: msg });
      throw new Error("Decision Stage failed");
    }

    // Finalize Updates
    med.status = decisionResult.decision === "rejected" ? "rejected" : "under_review";
    med.verificationResult = {
      confidence: decisionResult.confidence,
      isTampered: aiCheckResult.isTampered,
      isDuplicate: dbCheckResult.isDuplicate,
      isExpired: dbCheckResult.isExpired,
      isRecalled: aiCheckResult.isRecalled,
      aiReasoning: aiCheckResult.aiReasoning + " | " + decisionResult.reasoning,
      extractedData: ocrResult,
    };
    
    // Auto-fill extracted fields if they exist
    if (ocrResult.name) med.name = ocrResult.name;
    if (ocrResult.genericName) med.genericName = ocrResult.genericName;
    if (ocrResult.dosage) med.dosage = ocrResult.dosage;
    if (ocrResult.batchNumber) med.batchNumber = ocrResult.batchNumber;
    if (ocrResult.manufacturer) med.manufacturer = ocrResult.manufacturer;
    if (ocrResult.expiryDate && !isNaN(new Date(ocrResult.expiryDate).getTime())) {
      med.expiryDate = new Date(ocrResult.expiryDate);
    }
    await med.save();

    await notifyReviewers(med._id.toString(), med.name);

    return { success: true, decision: decisionResult.decision, logs };

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Pipeline failed:", error);
    await VerificationLog.create({
      medicineId,
      stage: "decision",
      status: "failure",
      details: { error: msg },
    });
    
    // Set to under review on pipeline failure to be safe
    await Medicine.findByIdAndUpdate(medicineId, { status: "under_review" });
    
    return { success: false, error: msg };
  }
}
