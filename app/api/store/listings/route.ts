import { NextResponse } from "next/server";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";


export async function GET() {
  try {
    await connectMongoose();
    
    const listings = await Medicine.find({ status: { $in: ['verified', 'approved'] } });

    if (!listings || listings.length === 0) {
      return NextResponse.json([]);
    }

    const formattedListings = listings.map(doc => {
      const expDate = doc.expiryDate 
        ? new Date(doc.expiryDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "Unknown";

      return {
        _id: doc._id,
        name: doc.name || doc.genericName || "Unknown",
        category: doc.category || "General",
        quantity: doc.quantity || 0,
        expiryDate: expDate,
        verifiedBy: 'Pharmacist + AI',
        price: 0, // Mock price logic or add to schema
        originalPrice: 100 // Mock original price logic or add to schema
      };
    });

    return NextResponse.json(formattedListings);
  } catch (error) {
    console.error("Error fetching store listings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
