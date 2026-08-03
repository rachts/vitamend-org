import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db/mongoose";
import { Inventory } from "@/models/Inventory";

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoose();

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const items = await Inventory.find({
      status: "available",
      expiryDate: { $lte: thirtyDaysFromNow },
    }).sort({ expiryDate: 1 }).lean();

    const now = new Date();
    const enrichedItems = items.map((item) => {
      const expiry = new Date(item.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...item, daysUntilExpiry };
    });

    return NextResponse.json({
      count: enrichedItems.length,
      items: enrichedItems,
    });

  } catch (error: unknown) {
    console.error("GET /api/inventory/alerts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
