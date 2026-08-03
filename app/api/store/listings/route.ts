import { NextResponse } from "next/server";
import connectMongoose from "@/lib/db/mongoose";
import { Medicine } from "@/models/Medicine";

const fallback = [
  { _id:'1', name:'Amoxicillin 500mg', category:'Antibiotic', quantity:200, expiryDate:'Dec 2026', verifiedBy:'Pharmacist + AI', price:25, originalPrice:180 },
  { _id:'2', name:'Metformin 500mg', category:'Antidiabetic', quantity:150, expiryDate:'Mar 2027', verifiedBy:'Pharmacist + AI', price:15, originalPrice:95 },
  { _id:'3', name:'Lisinopril 10mg', category:'Cardiovascular', quantity:300, expiryDate:'Jun 2027', verifiedBy:'Pharmacist + AI', price:30, originalPrice:210 },
  { _id:'4', name:'Paracetamol 650mg', category:'General', quantity:500, expiryDate:'Jan 2027', verifiedBy:'Pharmacist + AI', price:8, originalPrice:45 },
];

export async function GET() {
  try {
    await connectMongoose();
    
    const listings = await Medicine.find({ status: { $in: ['verified', 'approved'] } });

    if (!listings || listings.length === 0) {
      // FALLBACK — replace with real DB query once verified donations exist
      return NextResponse.json(fallback);
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
    // Return fallback on error just to keep the store functioning for the demo
    return NextResponse.json(fallback);
  }
}
