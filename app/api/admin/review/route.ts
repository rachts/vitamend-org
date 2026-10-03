import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { VerificationLog } from "@/models/VerificationLog";
import { Inventory } from "@/models/Inventory";
import { AILearningDataset } from "@/models/AILearningDataset";
import { sendNotification } from "@/lib/notifications";
import mongoose from "mongoose";
import { rateLimit } from "@/lib/rate-limit";
import { StockError, isUnexpiredDate, validateApproval } from "@/lib/stock-lifecycle";

export async function GET(req: Request) {
  try {
    if (!(await rateLimit(req, 100)).success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "under_review";
    const page = Math.max(1, Math.min(100000, parseInt(searchParams.get("page") || "1") || 1));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10") || 10));

    await connectMongoose();

    const skip = (page - 1) * limit;

    const [medicines, total] = await Promise.all([
      Medicine.find({ status }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Medicine.countDocuments({ status }),
    ]);

    // Batch query logs to avoid N+1 queries
    const medIds = medicines.map((m) => m._id);
    const logs = await VerificationLog.find({ medicineId: { $in: medIds } }).sort({ createdAt: 1 }).lean();
    
    const logsByMedId = new Map<string, typeof logs>();
    for (const log of logs) {
      const idStr = String(log.medicineId);
      if (!logsByMedId.has(idStr)) logsByMedId.set(idStr, []);
      logsByMedId.get(idStr)!.push(log);
    }

    const enrichedMedicines = medicines.map((med) => ({
      ...med,
      verificationLogs: logsByMedId.get(String(med._id)) || [],
    }));

    return NextResponse.json({
      medicines: enrichedMedicines,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/review error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await rateLimit(req, 30)).success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new StockError("Invalid payload");
    const { medicineId, decision, notes, correctedData } = body;
    if (typeof medicineId !== "string" || !mongoose.isObjectIdOrHexString(medicineId) || !["approved", "rejected"].includes(decision) || (notes !== undefined && (typeof notes !== "string" || notes.length > 2000))) {
      throw new StockError("Invalid payload");
    }
    const safeCorrections: Record<string, string> = {};
    if (correctedData !== undefined) {
      if (!correctedData || typeof correctedData !== "object" || Array.isArray(correctedData)) throw new StockError("Invalid corrected data");
      const allowed = ["name", "genericName", "dosage", "batchNumber", "manufacturer", "expiryDate"];
      for (const [key, value] of Object.entries(correctedData)) {
        if (!allowed.includes(key) || typeof value !== "string" || value.length > 300) throw new StockError("Invalid corrected data");
        safeCorrections[key] = value.trim();
      }
      if (safeCorrections.expiryDate !== undefined && !isUnexpiredDate(safeCorrections.expiryDate, -Infinity)) throw new StockError("Invalid corrected expiry date");
    }
    await connectMongoose();
    const dbSession = await mongoose.startSession();
    let donorId = "";
    let medicineName = "";
    try {
      await dbSession.withTransaction(async () => {
        const medicine = await Medicine.findById(medicineId).session(dbSession);
        if (!medicine) throw new StockError("Medicine not found", 404);
        if (medicine.status !== "under_review") throw new StockError("Medicine is no longer awaiting review", 409);
        const candidate = { ...medicine.toObject(), ...safeCorrections };
        if (decision === "approved") validateApproval(candidate);
        const originalPrediction = medicine.verificationResult?.extractedData;
        Object.assign(medicine, safeCorrections);
        medicine.status = decision;
        medicine.reviewNotes = notes;
        medicine.reviewedBy = session.user.id;
        await medicine.save({ session: dbSession });
        if (correctedData !== undefined) {
          await AILearningDataset.create([{ medicineId, originalPrediction, correctedPrediction: safeCorrections, correctionType: "classification", correctedBy: session.user.id }], { session: dbSession });
        }
        await VerificationLog.create([{ medicineId, stage: "manual_review", status: "success", details: { decision, notes, corrected: correctedData !== undefined }, confidence: 100 }], { session: dbSession });
        if (decision === "approved") {
          const id = medicine._id.toString();
          if (await Inventory.findOne({ donationId: id }).session(dbSession)) throw new StockError("Donation already has inventory", 409);
          await Inventory.create([{ medicineId: id, donationId: id, name: medicine.name, genericName: medicine.genericName, category: medicine.category, quantity: medicine.quantity, batchNumber: medicine.batchNumber, expiryDate: medicine.expiryDate, manufacturer: medicine.manufacturer, location: "Main Warehouse", status: "available" }], { session: dbSession });
        }
        donorId = medicine.donorId;
        medicineName = medicine.name;
      });
    } finally {
      await dbSession.endSession();
    }
    // A notification failure must not turn a committed review into an apparent failure.
    try {
      await sendNotification({ userId: donorId, type: "donation_update", title: `Donation ${decision === "approved" ? "Approved" : "Rejected"}`, message: `Your donation of ${medicineName} has been reviewed and ${decision}. ${notes || ""}` });
    } catch (error) {
      console.error("Review notification failed:", error);
    }
    return NextResponse.json({ success: true, message: `Medicine ${decision}` });
  } catch (error: unknown) {
    if (error instanceof StockError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "Donation already has inventory" }, { status: 409 });
    }
    console.error("POST /api/admin/review error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
