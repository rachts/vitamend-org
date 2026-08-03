import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { VerificationLog } from "@/models/VerificationLog";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !["admin", "volunteer"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden: Admins or Volunteers only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "under_review";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    await connectMongoose();

    const skip = (page - 1) * limit;

    const [medicines, total] = await Promise.all([
      Medicine.find({ status }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Medicine.countDocuments({ status }),
    ]);

    // Enrich with VerificationLogs
    const enrichedMedicines = await Promise.all(
      medicines.map(async (med) => {
        const logs = await VerificationLog.find({ medicineId: med._id }).sort({ createdAt: 1 }).lean();
        return { ...med, verificationLogs: logs };
      })
    );

    return NextResponse.json({
      medicines: enrichedMedicines,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/review-queue error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
