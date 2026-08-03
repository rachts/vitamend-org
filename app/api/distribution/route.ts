import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import mongoose from "mongoose";
import { Distribution } from "@/models/Distribution";
import { Inventory } from "@/models/Inventory";
import { Medicine } from "@/models/Medicine";
import { sendNotification } from "@/lib/notifications";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    await connectMongoose();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [distributions, total] = await Promise.all([
      Distribution.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Distribution.countDocuments(query),
    ]);

    return NextResponse.json({
      distributions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/distribution error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth?.user?.id || !["admin", "volunteer"].includes(sessionAuth.user.role)) {
      return NextResponse.json({ error: "Forbidden: Admins or Volunteers only" }, { status: 403 });
    }

    const body = await req.json();
    const { inventoryId, recipientType, recipientId, recipientName, quantity, notes } = body;

    if (!inventoryId || !recipientType || !recipientName || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectMongoose();

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let notificationData: any = null;
    let createdDistribution: unknown = null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inventory = await (Inventory as any).findById(inventoryId).session(dbSession);
      if (!inventory) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
      }

      if (inventory.status !== "available" && inventory.status !== "reserved") {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ error: "Inventory item is not available" }, { status: 400 });
      }

      if (inventory.quantity < quantity) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ error: "Insufficient inventory quantity" }, { status: 400 });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const distribution = await (Distribution as any).create(
        [
          {
            inventoryId,
            recipientType,
            recipientId,
            recipientName,
            quantity,
            status: "pending",
            distributedBy: sessionAuth.user.id,
            notes,
          },
        ],
        { session: dbSession }
      );
      createdDistribution = distribution[0];

      inventory.quantity -= quantity;
      if (inventory.quantity <= 0) {
        inventory.status = "distributed";
      } else {
        inventory.status = "reserved";
      }
      await inventory.save({ session: dbSession });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const medicine = await (Medicine as any).findById(inventory.medicineId).session(dbSession);
      if (medicine) {
        medicine.status = "distributed";
        await medicine.save({ session: dbSession });

        notificationData = {
          userId: medicine.donorId,
          type: "distribution_update" as const,
          title: "Your Donation was Distributed!",
          message: `Good news! ${quantity} units of your donated ${medicine.name} have been allocated to ${recipientName}.`,
        };
      }

      await dbSession.commitTransaction();
      dbSession.endSession();

      // Send notification AFTER transaction completes safely
      if (notificationData) {
        sendNotification(notificationData).catch((err) =>
          console.error("Notification failed:", err)
        );
      }

      return NextResponse.json({ success: true, distribution: createdDistribution }, { status: 201 });
    } catch (txnError) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw txnError;
    }
  } catch (error: unknown) {
    console.error("POST /api/distribution error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !["admin", "volunteer"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden: Admins or Volunteers only" }, { status: 403 });
    }

    const body = await req.json();
    const { distributionId, status, deliveryProof } = body;

    if (!distributionId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectMongoose();

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const distribution = await (Distribution as any).findById(distributionId).session(dbSession);
      if (!distribution) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ error: "Distribution record not found" }, { status: 404 });
      }

      distribution.status = status;
      if (status === "delivered") {
        distribution.distributedAt = new Date();
      }
      if (deliveryProof) {
        distribution.deliveryProof = deliveryProof;
      }
      await distribution.save({ session: dbSession });

      await dbSession.commitTransaction();
      dbSession.endSession();

      return NextResponse.json({ success: true, distribution });
    } catch (err) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw err;
    }
  } catch (error: unknown) {
    console.error("PATCH /api/distribution error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
