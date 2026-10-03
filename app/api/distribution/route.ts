import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import mongoose from "mongoose";
import { Distribution, DistributionRecipient, DistributionStatus } from "@/models/Distribution";
import { Inventory } from "@/models/Inventory";
import { Medicine } from "@/models/Medicine";
import { sendNotification } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { StockError, assertDistributionTransition } from "@/lib/stock-lifecycle";

function failure(error: unknown) {
  if (error instanceof StockError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error("Distribution request failed:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

export async function GET(req: Request) {
  try {
    if (!(await rateLimit(req, 100)).success) throw new StockError("Too many requests", 429);
    const session = await auth();
    if (!session?.user?.id) throw new StockError("Unauthorized", 401);
    if (session.user.role !== "admin") throw new StockError("Forbidden", 403);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    if (status && !DistributionStatus.includes(status as typeof DistributionStatus[number])) throw new StockError("Invalid status");
    const page = Math.max(1, Math.min(100000, parseInt(searchParams.get("page") || "1", 10) || 1));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10) || 10));
    await connectMongoose();
    const query = status ? { status } : {};
    const [distributions, total] = await Promise.all([
      Distribution.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Distribution.countDocuments(query),
    ]);
    return NextResponse.json({ distributions, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) { return failure(error); }
}

export async function POST(req: Request) {
  try {
    if (!(await rateLimit(req, 30)).success) throw new StockError("Too many requests", 429);
    const session = await auth();
    if (!session?.user?.id) throw new StockError("Unauthorized", 401);
    if (session.user.role !== "admin") throw new StockError("Forbidden", 403);
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new StockError("Invalid payload");
    const { inventoryId, recipientType, recipientId, recipientName, quantity, notes } = body;
    if (typeof inventoryId !== "string" || !mongoose.isObjectIdOrHexString(inventoryId) || !DistributionRecipient.includes(recipientType) || typeof recipientName !== "string" || !recipientName.trim() || recipientName.length > 200 || !Number.isInteger(quantity) || quantity < 1 || quantity > 100000 || (recipientId !== undefined && (typeof recipientId !== "string" || recipientId.length > 200)) || (notes !== undefined && (typeof notes !== "string" || notes.length > 2000))) throw new StockError("Invalid payload");
    await connectMongoose();
    const dbSession = await mongoose.startSession();
    let createdDistribution: unknown;
    try {
      await dbSession.withTransaction(async () => {
        // Conditional decrement plus transaction prevents concurrent overselling.
        const inventory = await Inventory.findOneAndUpdate(
          { _id: inventoryId, status: { $in: ["available", "reserved"] }, quantity: { $gte: quantity }, expiryDate: { $gt: new Date() } },
          { $inc: { quantity: -quantity } },
          { new: true, session: dbSession }
        );
        if (!inventory) throw new StockError("Inventory unavailable, expired, or insufficient", 409);
        inventory.status = inventory.quantity === 0 ? "reserved" : "available";
        await inventory.save({ session: dbSession });
        const [distribution] = await Distribution.create([{ inventoryId, recipientType, recipientId, recipientName: recipientName.trim(), quantity, status: "pending", distributedBy: session.user.id, notes }], { session: dbSession });
        createdDistribution = distribution;
        // Allocation is not delivery. The donation remains approved until all units are delivered.
      });
    } finally { await dbSession.endSession(); }
    return NextResponse.json({ success: true, distribution: createdDistribution }, { status: 201 });
  } catch (error) { return failure(error); }
}

export async function PATCH(req: Request) {
  try {
    if (!(await rateLimit(req, 30)).success) throw new StockError("Too many requests", 429);
    const session = await auth();
    if (!session?.user?.id) throw new StockError("Unauthorized", 401);
    if (session.user.role !== "admin") throw new StockError("Forbidden", 403);
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new StockError("Invalid payload");
    const { distributionId, status, deliveryProof } = body;
    if (typeof distributionId !== "string" || !mongoose.isObjectIdOrHexString(distributionId) || !DistributionStatus.includes(status) || (deliveryProof !== undefined && (typeof deliveryProof !== "string" || deliveryProof.length > 2000))) throw new StockError("Invalid payload");
    await connectMongoose();
    const dbSession = await mongoose.startSession();
    let updatedDistribution: unknown;
    let notification: Parameters<typeof sendNotification>[0] | undefined;
    try {
      await dbSession.withTransaction(async () => {
        notification = undefined;
        const distribution = await Distribution.findById(distributionId).session(dbSession);
        if (!distribution) throw new StockError("Distribution record not found", 404);
        assertDistributionTransition(distribution.status, status);
        distribution.status = status;
        if (status === "delivered") distribution.distributedAt = new Date();
        if (deliveryProof !== undefined) distribution.deliveryProof = deliveryProof;
        // Writing this document serializes competing cancellations; a retry sees cancelled and refuses.
        await distribution.save({ session: dbSession });
        const inventory = await Inventory.findById(distribution.inventoryId).session(dbSession);
        if (!inventory) throw new StockError("Inventory record not found", 409);
        if (status === "cancelled") {
          inventory.quantity += distribution.quantity;
          inventory.status = inventory.expiryDate.getTime() <= Date.now() ? "expired" : "available";
        }
        // Every transition touches the shared stock row, preventing write skew between deliveries.
        inventory.markModified("status");
        await inventory.save({ session: dbSession });
        const outstanding = await Distribution.exists({ inventoryId: distribution.inventoryId, status: { $in: ["pending", "in_transit"] } }).session(dbSession);
        const fullyDelivered = inventory.quantity === 0 && !outstanding;
        if (status === "delivered" && fullyDelivered) {
          inventory.status = "distributed";
          await inventory.save({ session: dbSession });
        }
        if (mongoose.isObjectIdOrHexString(inventory.medicineId)) {
          const medicine = await Medicine.findById(inventory.medicineId).session(dbSession);
          if (medicine && ["approved", "distributed"].includes(medicine.status)) {
            medicine.status = fullyDelivered ? "distributed" : "approved";
            await medicine.save({ session: dbSession });
            if (status === "delivered") notification = { userId: medicine.donorId, type: "distribution_update", title: "Donation Delivery Confirmed", message: `${distribution.quantity} units of your donated ${medicine.name} were delivered to ${distribution.recipientName}.` };
          }
        }
        updatedDistribution = distribution;
      });
    } finally { await dbSession.endSession(); }
    if (notification) {
      try { await sendNotification(notification); } catch (error) { console.error("Delivery notification failed:", error); }
    }
    return NextResponse.json({ success: true, distribution: updatedDistribution });
  } catch (error) { return failure(error); }
}
