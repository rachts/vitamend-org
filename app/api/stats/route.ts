import { NextResponse } from "next/server";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { User } from "@/models/User";

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
      Medicine.countDocuments(),
      Medicine.countDocuments({ status: { $in: ["approved", "distributed", "disposed"] } }),
      Medicine.countDocuments({ status: "rejected" }),
      Medicine.countDocuments({ status: "distributed" }),
      User.countDocuments({ role: "volunteer" }),
      User.countDocuments({ role: "ngo" }) // Assuming 'ngo' or recipient represents clinics
    ]);

    // Track actual patients treated via Distribution model, or omit if not tracked
    const peopleHelped = 0; // Will be implemented when Distribution.patientsTreated field is added

    return NextResponse.json({
      success: true,
      stats: {
        medicinesDonated,
        approvedDonations,
        rejectedDonations,
        distributedMedicines,
        peopleHelped: Math.floor(peopleHelped),
        volunteers,
        activeClinics: clinics
      }
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
