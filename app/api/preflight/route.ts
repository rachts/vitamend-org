import { NextResponse } from "next/server";
import connectMongoose from "@/lib/db";
import { extractMedicineInfo } from "@/lib/extractor";
import { validateMedicineDetails } from "@/lib/validator";

type CheckStatus = "pass" | "fail" | "warning";

export async function GET() {
  const checks: { id: string; name: string; description: string; status: CheckStatus; details: string; estimatedFixTime: string }[] = [
    {
      id: "vision",
      name: "Google Gemini Vision API Connection",
      description: "Verifies Gemini AI SDK credentials.",
      status: process.env.GEMINI_API_KEY ? "warning" : "fail",
      details: process.env.GEMINI_API_KEY ? "Credential configured; provider connectivity has not been tested." : "GEMINI_API_KEY is missing.",
      estimatedFixTime: "3 mins (check .env.local GEMINI_API_KEY)",
    },
    {
      id: "database",
      name: "Database Storage & Ledger Connection",
      description: "Tests connectivity to MongoDB Atlas cluster.",
      status: "pass",
      details: "MongoDB connectivity active.",
      estimatedFixTime: "0 mins",
    },
    {
      id: "flows",
      name: "Complete User Journey Smoke Test",
      description: "Validates route parameters for intake workflows.",
      status: "warning",
      details: "User journey not executed by this endpoint.",
      estimatedFixTime: "0 mins",
    },
    {
      id: "ocr_pipeline",
      name: "Local text parser sample",
      description: "Parses fixture text; does not test image OCR or provider accuracy.",
      status: "pass",
      details: "Local text parsing passed. Image OCR has not been tested.",
      estimatedFixTime: "0 mins",
    },
  ];

  // Database ping
  try {
    await connectMongoose();
    const dbCheck = checks.find((c) => c.id === "database");
    if (dbCheck) {
      dbCheck.status = "pass";
      dbCheck.details = "Connected to MongoDB successfully.";
    }
  } catch {
    const dbCheck = checks.find((c) => c.id === "database");
    if (dbCheck) {
      dbCheck.status = "fail";
      dbCheck.details = "Failed to connect to MongoDB";
    }
  }

  // Sample OCR test
  const sampleText = "SUN PHARMA\nAMOXICILLIN TRIHYDRATE CAPSULES IP 500mg\nB.No. BT-48291\nEXP. DATE: 03/2028";
  const extracted = extractMedicineInfo(sampleText);
  const validated = validateMedicineDetails(extracted);

  if (!extracted.medicineName || !validated.isValid) {
    const ocrCheck = checks.find((c) => c.id === "ocr_pipeline");
    if (ocrCheck) {
      ocrCheck.status = "fail";
      ocrCheck.details = "Sample parsing failed extraction or validation verification.";
    }
  }

  // Calculate overallStatus AFTER all mutations
  const overallStatus = checks.every((c) => c.status === "pass") ? "ALL_GREEN" : "DEGRADED";

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    overallStatus,
    checks,
  });
}
