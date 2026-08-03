import { GoogleGenerativeAI } from "@google/generative-ai";
import { VerificationLog, Medicine, Inventory, MedicineStatus } from "@/models";
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

    // ==========================================
    // STAGE 1: OCR (Gemini 1.5 Flash Vision)
    // ==========================================
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
      const text = result.response.text().replace(/```json|```/g, "").trim();
      ocrResult = OcrResultSchema.parse(JSON.parse(text));

      await logStage("ocr", "success", ocrResult, ocrResult.confidence);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      await logStage("ocr", "failure", { error: msg });
      throw new Error("OCR Stage failed: Invalid AI response format");
    }

    // ==========================================
    // STAGE 2: AI Verification (Gemini 1.5 Flash)
    // ==========================================
    let aiCheckResult: AICheckResult;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze these images for tampering signs (broken seals, discoloration, mismatched labels, water damage, re-glued packaging). Also, check if the medicine '${ocrResult.name}' by '${ocrResult.manufacturer}' is known to be part of any recent FDA/global recalled batches. Return strict JSON only with fields: isTampered (boolean), tamperConfidence (number 0-100), isRecalled (boolean), recallReason (string or null), aiReasoning (string explanation).`;
      
      const result = await model.generateContent([prompt, ...imageParts]);
      const text = result.response.text().replace(/```json|```/g, "").trim();
      aiCheckResult = JSON.parse(text);

      const status = aiCheckResult.isTampered || aiCheckResult.isRecalled ? "warning" : "success";
      await logStage("ai_check", status, aiCheckResult, aiCheckResult.tamperConfidence);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      await logStage("ai_check", "failure", { error: msg });
      throw new Error("AI Verification Stage failed");
    }

    // ==========================================
    // STAGE 3: Database Cross-Check
    // ==========================================
    let dbCheckResult: DBCheckResult;
    try {
      const parsedExpiry = new Date(ocrResult.expiryDate || Date.now());
      if (isNaN(parsedExpiry.getTime())) {
        // Fallback or just set a generic past date to trigger expiry
        parsedExpiry.setFullYear(2000);
      }

      const isExpired = parsedExpiry < new Date();

      // Check Duplicates in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fuzzy regex match on name
      function escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      const regexName = new RegExp(escapeRegExp(ocrResult.name || ""), "i");

      const duplicates = await Medicine.countDocuments({
        _id: { $ne: medicineId },
        name: { $regex: regexName },
        batchNumber: ocrResult.batchNumber,
        createdAt: { $gte: thirtyDaysAgo },
        status: { $in: ["pending", "under_review", "approved"] },
      });

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

    // ==========================================
    // STAGE 4: Decision Engine
    // ==========================================
    let decisionResult: DecisionResult;
    try {
      let finalConfidence = ocrResult.confidence;
      let reasoning = "";

      if (aiCheckResult.isTampered) {
        finalConfidence -= 40;
        reasoning += "Penalty: Tampering detected (-40). ";
      }
      if (aiCheckResult.isRecalled) {
        finalConfidence -= 50;
        reasoning += "Penalty: Recalled batch (-50). ";
      }
      if (dbCheckResult.isExpired) {
        finalConfidence -= 60;
        reasoning += "Penalty: Medicine is expired (-60). ";
      }
      if (dbCheckResult.isDuplicate) {
        finalConfidence -= 20;
        reasoning += "Penalty: Duplicate batch submitted recently (-20). ";
      }
      if (ocrResult.confidence < 60) {
        finalConfidence -= 15;
        reasoning += "Penalty: Low OCR clarity (-15). ";
      }

      finalConfidence = Math.max(0, Math.min(100, finalConfidence));

      let decision: "approved" | "rejected" | "under_review" = "under_review";
      if (finalConfidence >= 85 && !aiCheckResult.isTampered && !dbCheckResult.isExpired && !aiCheckResult.isRecalled) {
        decision = "approved";
        reasoning += "Decision: Approved (Meets all safety criteria).";
      } else if (finalConfidence < 50 || aiCheckResult.isTampered || dbCheckResult.isExpired || aiCheckResult.isRecalled) {
        decision = "rejected";
        reasoning += "Decision: Rejected (Critical safety failure).";
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

    // ==========================================
    // Finalize Updates
    // ==========================================
    med.status = decisionResult.decision as typeof MedicineStatus[number];
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

    if (decisionResult.decision === "approved") {
      const existingInventory = await Inventory.findOne({ medicineId: med._id });
      if (!existingInventory) {
        await Inventory.create({
          medicineId: med._id,
          name: med.name,
          genericName: med.genericName,
          quantity: med.quantity,
          batchNumber: med.batchNumber,
          expiryDate: med.expiryDate,
          manufacturer: med.manufacturer,
          location: "Main Warehouse",
          status: "available",
          donationId: med._id, // the donation IS the medicine record initially
        });
      }
    } else if (decisionResult.decision === "under_review") {
      await notifyReviewers(med._id.toString(), med.name);
    }

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
