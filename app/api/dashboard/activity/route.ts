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

    // Retrieve last 10 donations for this user, sorted by createdAt desc
    const recentDonations = await Medicine.find({ donorId: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedDonations = recentDonations.map((doc) => {
      const dateString = doc.createdAt 
        ? new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
        : "Unknown Date";

      return {
        _id: doc._id,
        date: dateString,
        medicationName: doc.name || doc.genericName || "Unknown Medication",
        status: doc.status,
        quantity: doc.quantity,
        destination: "Pending Allocation" // Destination isn't directly on Donation schema
      };
    });

    return NextResponse.json(formattedDonations);
  } catch (error) {
    console.error("Error fetching dashboard activity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
