import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { VerificationLog } from "@/models/VerificationLog";
import { Inventory } from "@/models/Inventory";
import { AILearningDataset } from "@/models/AILearningDataset";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !["admin", "volunteer"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden: Admins or Volunteers only" }, { status: 403 });
    }
    const body = await req.json();
    const { medicineId, decision, notes, correctedData } = body;
    if (!medicineId || !["approved", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await connectMongoose();
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }
    // Process corrections if any
    if (correctedData) {
      await AILearningDataset.create({
        medicineId,
        originalPrediction: medicine.verificationResult?.extractedData,
        correctedPrediction: correctedData,
        correctionType: "classification",
        correctedBy: session.user.id,
      });
      // Apply corrections to medicine record
      Object.assign(medicine, correctedData);
    }
    medicine.status = decision;
    medicine.reviewNotes = notes;
    medicine.reviewedBy = session.user.id;
    await medicine.save();
    await VerificationLog.create({
      medicineId,
      stage: "manual_review",
      status: "success",
      details: { decision, notes, corrected: !!correctedData },
      confidence: 100,
    });
    if (decision === "approved") {
      const existingInventory = await Inventory.findOne({ donationId: medicine._id.toString() });
      if (!existingInventory) {
        await Inventory.create({
          medicineId: medicine._id.toString(),
          name: medicine.name,
          genericName: medicine.genericName,
          quantity: medicine.quantity,
          batchNumber: medicine.batchNumber,
          expiryDate: medicine.expiryDate,
          manufacturer: medicine.manufacturer,
          location: "Main Warehouse",
          status: "available",
          donationId: medicine._id.toString(),
        });
      }
    }
    // Notify the donor
    await sendNotification({
      userId: medicine.donorId,
      type: "donation_update",
      title: `Donation ${decision === "approved" ? "Approved" : "Rejected"}`,
      message: `Your donation of ${medicine.name} has been reviewed and ${decision}. ${notes || ""}`,
    });
    return NextResponse.json({ success: true, message: `Medicine ${decision}` });
  } catch (error: unknown) {
    console.error("POST /api/admin/review error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
