import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db/mongoose";
import { Inventory } from "@/models";

interface RawInventoryItem {
  _id: unknown;
  medicineId: string;
  name: string;
  genericName?: string;
  category?: string;
  quantity: number;
  batchNumber?: string;
  expiryDate: Date | string;
  manufacturer?: string;
  location: string;
  status: string;
  donationId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const location = searchParams.get("location");
    const category = searchParams.get("category");

    const rawPage = searchParams.get("page") ?? "1";
    const rawLimit = searchParams.get("limit") ?? "20";
    const page = Number.isNaN(Number(rawPage)) ? 1 : Math.max(1, Number(rawPage));
    const limit = Number.isNaN(Number(rawLimit)) ? 20 : Math.min(100, Math.max(1, Number(rawLimit)));

    await connectMongoose();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (location) query.location = location;
    if (category && category !== "All Stock") query.category = category;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Inventory.find(query).sort({ expiryDate: 1 }).skip(skip).limit(limit).lean(),
      Inventory.countDocuments(query),
    ]);

    const now = new Date();
    const enrichedItems = (items as unknown as RawInventoryItem[]).map((item) => {
      const expiry = new Date(item.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const daysUntilExpiry = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return { ...item, daysUntilExpiry };
    });

    return NextResponse.json({
      items: enrichedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/inventory error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { name, quantity, expiryDate, genericName, category, batchNumber, manufacturer, location, status } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Medicine name is required" }, { status: 400 });
    }

    const parsedQty = Number(quantity);
    if (Number.isNaN(parsedQty) || parsedQty <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 });
    }

    if (!expiryDate) {
      return NextResponse.json({ error: "Expiry date is required" }, { status: 400 });
    }

    const parsedExpiry = new Date(expiryDate);
    if (Number.isNaN(parsedExpiry.getTime())) {
      return NextResponse.json({ error: "Invalid expiry date format" }, { status: 400 });
    }

    const now = new Date();
    if (parsedExpiry <= now) {
      return NextResponse.json({ error: "Medicine is already expired and cannot be added to inventory" }, { status: 400 });
    }

    await connectMongoose();

    const uniqueId = `MED-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const donationId = `DON-${Date.now()}`;

    const newInventory = await Inventory.create({
      medicineId: uniqueId,
      name: name.trim(),
      genericName: genericName ? String(genericName).trim() : undefined,
      category: category ? String(category).trim() : "General",
      quantity: parsedQty,
      batchNumber: batchNumber ? String(batchNumber).trim() : undefined,
      expiryDate: parsedExpiry,
      manufacturer: manufacturer ? String(manufacturer).trim() : undefined,
      location: location ? String(location).trim() : "Main Warehouse",
      status: status || "available",
      donationId,
    });

    return NextResponse.json(
      {
        success: true,
        data: newInventory,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/inventory error:", error);
    return NextResponse.json({ error: "Failed to create inventory record" }, { status: 500 });
  }
}
