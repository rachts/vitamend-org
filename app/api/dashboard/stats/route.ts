import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db/mongoose";
import { Medicine } from "@/models/Medicine";

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session.user as { id?: string; _id?: string }).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoose();
    const userId = (session.user as { id?: string; _id?: string }).id;

    // Retrieve all donations for this user
    const userDonations = await Medicine.find({ donorId: userId });

    const totalDonations = userDonations.length;
    
    // impactScore: sum of all quantity fields × 10
    const impactScore = userDonations.reduce((acc, doc) => acc + (doc.quantity || 0) * 10, 0);
    
    // pendingPickups: count where status === 'pending' or 'scheduled'
    const pendingPickups = userDonations.filter(doc => {
      const s = doc.status as string;
      return s === 'pending' || s === 'under_review' || s === 'scheduled';
    }).length;

    return NextResponse.json({
      totalDonations,
      impactScore,
      pendingPickups
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
