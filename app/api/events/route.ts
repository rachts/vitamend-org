import { NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/db';
import { VerificationLog } from '@/models/VerificationLog';
import { Medicine } from '@/models/Medicine';

// Using server-side polling to drive the live visualization
export async function GET() {
  try {
    await connectMongoose();
    // Fetch last 10 verification logs to populate the ledger on initial load
    const logs = await VerificationLog.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const medIds = [...new Set(logs.map(l => l.medicineId).filter(Boolean))];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawMedicines = (await (Medicine as any).find({ _id: { $in: medIds } }).select('name genericName status').lean()) as Array<{ _id: { toString: () => string }; name?: string }>;
    const medMap = new Map<string, { name?: string }>(rawMedicines.map((m) => [m._id.toString(), m]));

    const formattedEvents = logs.map(log => {
      let type = "VERIFICATION_PENDING";
      let title = "System Check";
      let description = "Processing data...";
      const details = log.details as { decision?: string } | undefined;
      if (log.stage === "ocr" && log.status === "success") {
        type = "OCR_COMPLETED";
        title = "AI Vision Extraction";
        description = "AI extracted details from image.";
      } else if (log.stage === "decision" && log.status === "success") {
        type = "PHARMACIST_APPROVED";
        title = "Verification Complete";
        description = details?.decision === "approved" ? "Medicine cleared for donation." : "Medicine routed for manual review.";
      }
      const med = medMap.get(log.medicineId);
      return {
        id: log._id.toString(),
        type,
        title,
        description,
        medicineName: med?.name || "Unknown Medicine",
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
