import { OCRApiResponse } from "@/types/medicine";

export function getDemoOCRResponse(fileName: string, startTime: number): OCRApiResponse | null {
  const lowerName = fileName.toLowerCase();

  // Offline / Demo Fallback Mode (DEMO_MODE=true in .env.local or environment) with 5 Supported Indian Pharmaceutical labels
  if (
    process.env.DEMO_MODE === "true" ||
    lowerName.includes("crocin") ||
    lowerName.includes("dolo") ||
    lowerName.includes("amox") ||
    lowerName.includes("azith") ||
    lowerName.includes("para")
  ) {
    let sampleData = {
      medicineName: "AMOXICILLIN TRIHYDRATE IP",
      dosage: "500mg",
      batchNumber: "BTH-2025-889",
      expiryDate: "03/2028",
      manufacturer: "Sun Pharma Labs Ltd.",
      mrp: "Rs. 145.00",
      rawText:
        "SUN PHARMA\nAMOXICILLIN TRIHYDRATE CAPSULES IP 500mg\nB.No. BTH-2025-889\nEXP. DATE: 03/2028\nM.R.P. Rs. 145.00\nMfg. Lic. No. M/756/2018",
      confidence: 95,
    };

    if (lowerName.includes("crocin")) {
      sampleData = {
        medicineName: "Crocin Advance (Paracetamol IP)",
        dosage: "500mg",
        batchNumber: "CR-88290",
        expiryDate: "08/2027",
        manufacturer: "GSK Healthcare / Haleon Labs",
        mrp: "Rs. 30.00",
        rawText:
          "GSK HEALTHCARE\nCROCIN ADVANCE PARACETAMOL TABLETS IP 500mg\nBATCH NO: CR-88290\nEXPIRY: 08/2027\nM.R.P.: Rs. 30.00 INCL. OF ALL TAXES\nMFG LIC NO: 28/UA/2019",
        confidence: 97,
      };
    } else if (lowerName.includes("dolo") || lowerName.includes("650")) {
      sampleData = {
        medicineName: "Dolo 650 (Paracetamol Tablets IP)",
        dosage: "650mg",
        batchNumber: "DL-2025-99",
        expiryDate: "11/2027",
        manufacturer: "Micro Labs Ltd.",
        mrp: "Rs. 34.00",
        rawText:
          "MICRO LABS LTD\nDOLO 650 PARACETAMOL TABLETS IP 650mg\nB.NO. DL-2025-99\nEXP. DATE: 11/2027\nMAX. RETAIL PRICE RS. 34.00\nMFG. LIC. NO.: KTK/25/611/2014",
        confidence: 98,
      };
    } else if (lowerName.includes("azith") || lowerName.includes("azee")) {
      sampleData = {
        medicineName: "Azithromycin Tablets IP (Azee 500)",
        dosage: "500mg",
        batchNumber: "AZ-99120",
        expiryDate: "05/2028",
        manufacturer: "Cipla Ltd.",
        mrp: "Rs. 119.00",
        rawText:
          "CIPLA LTD\nAZEE 500 AZITHROMYCIN TABLETS IP 500mg\nLOT NO: AZ-99120\nEXP: 05/2028\nM.R.P. RS. 119.00\nMFG LIC NO: M/482/2017",
        confidence: 95,
      };
    } else if (lowerName.includes("para") && !lowerName.includes("crocin") && !lowerName.includes("dolo")) {
      sampleData = {
        medicineName: "Paracetamol Tablets IP",
        dosage: "500mg",
        batchNumber: "PR-10294",
        expiryDate: "12/2027",
        manufacturer: "Mankind Pharma Ltd.",
        mrp: "Rs. 25.00",
        rawText:
          "MANKIND PHARMA LTD\nPARACETAMOL TABLETS IP 500mg\nBATCH N.: PR-10294\nEXP. DATE: 12/2027\nM.R.P. Rs. 25.00 INCL. OF ALL TAXES\nMFG. LIC. NO.: M-55/2021",
        confidence: 96,
      };
    }

    return {
      success: true,
      extracted: {
        medicineName: sampleData.medicineName,
        dosage: sampleData.dosage,
        batchNumber: sampleData.batchNumber,
        expiryDate: sampleData.expiryDate,
        manufacturer: sampleData.manufacturer,
        mrp: sampleData.mrp,
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        hasRequiredFields: true,
        expiryValid: true,
        batchValid: true,
        summary:
          "Validated against CDSCO medicine safety guidelines. Potency active with significant shelf-life remaining.",
      },
      confidence: sampleData.confidence,
      rawText: sampleData.rawText,
      processingTimeMs: Date.now() - startTime,
      isDemoMode: true,
      daysUntilExpiry: 600,
    };
  }

  return null;
}
