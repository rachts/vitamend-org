import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { Inventory } from "@/models/Inventory";
import { Distribution } from "@/models/Distribution";
import { VerificationLog } from "@/models/VerificationLog";

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !["admin", "volunteer"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden: Admins or Volunteers only" }, { status: 403 });
    }

    await connectMongoose();

    // 1. Donations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalDonations = await (Medicine as any).countDocuments();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const approvedDonations = await (Medicine as any).countDocuments({ status: { $in: ["approved", "distributed"] } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rejectedDonations = await (Medicine as any).countDocuments({ status: "rejected" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pendingDonations = await (Medicine as any).countDocuments({ status: "pending" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const distributedDonations = await (Medicine as any).countDocuments({ status: "distributed" });

    const successRate = totalDonations > 0 ? parseFloat(((approvedDonations / totalDonations) * 100).toFixed(1)) : 0;

    // 2. Inventory
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalItems = await (Inventory as any).countDocuments();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inventoryStats = await (Inventory as any).aggregate([
      { $match: { status: "available" } },
      { $group: { _id: null, totalStock: { $sum: "$quantity" } } },
    ]).option({ maxTimeMS: 5000 });
    const totalStock = inventoryStats.length > 0 ? inventoryStats[0].totalStock : 0;

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expiringSoon = await (Inventory as any).countDocuments({
      status: "available",
      expiryDate: { $lte: thirtyDaysFromNow },
    });

    // 3. Distribution
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalDist = await (Distribution as any).countDocuments();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deliveredDist = await (Distribution as any).countDocuments({ status: "delivered" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pendingDist = await (Distribution as any).countDocuments({ status: "pending" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inTransitDist = await (Distribution as any).countDocuments({ status: "in_transit" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const byType = await (Distribution as any).aggregate([
      { $group: { _id: "$recipientType", count: { $sum: 1 }, totalQuantity: { $sum: "$quantity" } } },
    ]).option({ maxTimeMS: 5000 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const distQtyStats = await (Distribution as any).aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, qty: { $sum: "$quantity" } } },
    ]).option({ maxTimeMS: 5000 });
    const totalDeliveredQty = distQtyStats.length > 0 ? distQtyStats[0].qty : 0;

    // 4. Impact Metrics
    const medicinesSaved = totalStock + totalDeliveredQty;
    const estimatedLivesImpacted = Math.round(totalDeliveredQty * 2.5);
    const co2SavedKg = Math.round(totalDeliveredQty * 0.5);
    const waterSavedLiters = totalDeliveredQty * 50;

    // 5. Monthly Trends
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthlyTrendsRaw = await (Medicine as any).aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
          approved: { $sum: { $cond: [{ $in: ["$status", ["approved", "distributed"]] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]).option({ maxTimeMS: 5000 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthlyTrends = monthlyTrendsRaw.map((m: any) => ({
      label: `${m._id.year}-${m._id.month.toString().padStart(2, "0")}`,
      count: m.count,
      approved: m.approved,
      rejected: m.rejected,
    }));

    // 6. AI Performance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decisionLogs = await (VerificationLog as any).find({ stage: "decision" }).lean();
    const totalVerifications = decisionLogs.length;
    let autoApproved = 0;
    let autoRejected = 0;
    let manualReview = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decisionLogs.forEach((log: any) => {
      const decision = (log.details as Record<string, unknown>)?.decision;
      if (decision === "approved") autoApproved++;
      else if (decision === "rejected") autoRejected++;
      else if (decision === "under_review") manualReview++;
    });

    const accuracy =
      totalVerifications > 0
        ? parseFloat((((autoApproved + autoRejected) / totalVerifications) * 100).toFixed(1))
        : 0;

    return NextResponse.json({
      donations: {
        total: totalDonations,
        approved: approvedDonations,
        rejected: rejectedDonations,
        pending: pendingDonations,
        distributed: distributedDonations,
        successRate,
      },
      inventory: {
        totalItems,
        totalStock,
        expiringSoon,
      },
      distribution: {
        total: totalDist,
        delivered: deliveredDist,
        pending: pendingDist,
        inTransit: inTransitDist,
        byType,
      },
      impact: {
        medicinesSaved,
        estimatedLivesImpacted,
        co2SavedKg,
        waterSavedLiters,
      },
      trends: monthlyTrends,
      aiPerformance: {
        totalVerifications,
        autoApproved,
        autoRejected,
        manualReview,
        accuracy,
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
