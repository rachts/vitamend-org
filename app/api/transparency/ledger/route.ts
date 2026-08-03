import { NextResponse } from "next/server";
import connectMongoose from "@/lib/db/mongoose";
import { Distribution } from "@/models/Distribution";
import { Medicine } from "@/models/Medicine";
import { Inventory } from "@/models/Inventory";

export async function GET() {
  try {
    await connectMongoose();
    const distributions = await Distribution.find({ status: "delivered" })
      .sort({ distributedAt: -1 })
      .limit(100)
      .lean();

    const formatted = await Promise.all(
      distributions.map(async (d) => {
        const inventory = await Inventory.findById(d.inventoryId).lean();
        const medicine = inventory ? await Medicine.findById(inventory.medicineId).lean() : null;
        return {
          _id: d._id.toString(),
          date: d.distributedAt ? new Date(d.distributedAt).toLocaleDateString() : "Pending",
          item: medicine?.name || "Unknown",
          quantity: d.quantity,
          recipient: d.recipientName,
          recipientType: d.recipientType,
          status: d.status,
        };
      })
    );

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching transparency ledger:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
