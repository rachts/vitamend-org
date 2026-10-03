import { NextResponse } from "next/server";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { User } from "@/models/User";
import { Distribution } from "@/models/Distribution";

export async function GET() {
  try {
    await connectMongoose();

    const [
      medicinesDonated,
      approvedDonations,
      rejectedDonations,
      distributedMedicines,
      volunteers,
       clinics
    ] = await Promise.all([
       Medicine.aggregate<{ total: number }>([{ $group: { _id: null, total: { $sum: "$quantity" } } }]),
      Medicine.countDocuments({ status: { $in: ["approved", "distributed", "disposed"] } }),
      Medicine.countDocuments({ status: "rejected" }),
       Distribution.aggregate<{ total: number }>([{ $match: { status: "delivered" } }, { $group: { _id: null, total: { $sum: "$quantity" } } }]),
      User.countDocuments({ role: "volunteer" }),
       Distribution.distinct("recipientId", { status: "delivered", recipientType: "hospital", recipientId: { $exists: true, $nin: [null, ""] } })
    ]);

    // Track actual patients treated via Distribution model, or omit if not tracked
    const peopleHelped = null; // Patient outcomes are not tracked.

    return NextResponse.json({
      success: true,
      stats: {
        medicinesDonated: medicinesDonated[0]?.total ?? 0,
        approvedDonations,
        rejectedDonations,
        distributedMedicines: distributedMedicines[0]?.total ?? 0,
        peopleHelped,
        volunteers,
        activeClinics: clinics.length
      }
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
