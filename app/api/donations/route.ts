import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { Inventory } from "@/models/Inventory";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectMongoose();

    const name = body.medicineName || body.name;
    const quantity = Number(body.quantity) || 1;
    const expiryDate = body.expiryDate ? new Date(body.expiryDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const donation = await (Medicine as any).create({
      donorId: session.user.id,
      name,
      genericName: body.genericName || null,
      dosage: body.dosage || null,
      batchNumber: body.batchNumber || null,
      manufacturer: body.manufacturer || null,
      quantity,
      expiryDate,
      images: body.images || [],
      status: "verified",
    });

    const donationId = donation._id.toString();
    const uniqueId = `MED-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Auto-create matching inventory record if non-expired
    if (expiryDate > new Date() && name) {
      await Inventory.create({
        medicineId: uniqueId,
        name,
        genericName: body.genericName || undefined,
        category: body.category || "General",
        quantity,
        batchNumber: body.batchNumber || undefined,
        expiryDate,
        manufacturer: body.manufacturer || undefined,
        location: body.location || "Main Warehouse",
        status: "available",
        donationId,
      });
    }

    return NextResponse.json({ success: true, donationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    await connectMongoose();

    const { searchParams } = new URL(req.url);
    const rawPage = searchParams.get("page") ?? "1";
    const rawLimit = searchParams.get("limit") ?? "20";
    const page = Number.isNaN(Number(rawPage)) ? 1 : Math.max(1, Number(rawPage));
    const limit = Number.isNaN(Number(rawLimit)) ? 20 : Math.min(100, Math.max(1, Number(rawLimit)));

    let query: Record<string, unknown> = {};
    if (session?.user?.id) {
      query = { donorId: session.user.id };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const donations = await (Medicine as any).find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, donations, page, limit });
  } catch (error) {
    console.error("API /donations GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", donations: [] },
      { status: 500 }
    );
  }
}
