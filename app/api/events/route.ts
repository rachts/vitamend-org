import { NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/db';
import { VerificationLog } from '@/models/VerificationLog';
// Using server-side polling to drive the live visualization
export async function GET() {
  try {
    await connectMongoose();
    // Fetch last 10 verification logs to populate the ledger on initial load
    const logs = await VerificationLog.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('medicineId', 'name genericName status');
    const formattedEvents = logs.map(log => {
      let type = "VERIFICATION_PENDING";
      let title = "System Check";
      let description = "Processing data...";
      if (log.stage === "ocr" && log.status === "success") {
        type = "OCR_COMPLETED";
        title = "AI Vision Extraction";
        description = "AI extracted details from image.";
      } else if (log.stage === "decision" && log.status === "success") {
        type = "PHARMACIST_APPROVED";
        title = "Verification Complete";
        description = log.details?.decision === "approved" ? "Medicine cleared for donation." : "Medicine routed for manual review.";
      }
      return {
        id: log._id.toString(),
        type,
        title,
        description,
        medicineName: (log.medicineId as any)?.name || "Unknown Medicine",
        confidence: log.confidence,
        timestamp: new Date(log.createdAt).getTime(),
      };
    });
    return NextResponse.json({ success: true, events: formattedEvents });
  } catch (error) {
    console.error("Events endpoint error:", error);
    return NextResponse.json({ success: false, events: [] }, { status: 500 });
  }
}
