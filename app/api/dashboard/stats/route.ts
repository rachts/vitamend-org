import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session.user as { id?: string; _id?: string }).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoose();
    const userId = (session.user as { id?: string; _id?: string }).id;

    const [totals] = await Medicine.aggregate<{ totalDonations: number; donatedUnits: number; pendingReviews: number }>([
      { $match: { donorId: userId } },
      { $group: { _id: null, totalDonations: { $sum: 1 }, donatedUnits: { $sum: "$quantity" }, pendingReviews: { $sum: { $cond: [{ $in: ["$status", ["pending", "under_review"]] }, 1, 0] } } } },
    ]);

    return NextResponse.json({
      totalDonations: totals?.totalDonations ?? 0,
      donatedUnits: totals?.donatedUnits ?? 0,
      pendingReviews: totals?.pendingReviews ?? 0,
      impactScore: null,
      pendingPickups: null
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
