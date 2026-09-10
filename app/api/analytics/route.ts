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

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      medicineStatusCounts,
      totalItems,
      inventoryStats,
      expiringSoon,
      distStatusStats,
      byType,
      monthlyTrendsRaw,
      decisionStats,
    ] = await Promise.all([
      // 1. Medicine status counts in a single aggregation
      Medicine.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // 2. Inventory counts
      Inventory.countDocuments(),

      // 3. Available stock total quantity
      Inventory.aggregate([
        { $match: { status: "available" } },
        { $group: { _id: null, totalStock: { $sum: "$quantity" } } },
      ]),

      // 4. Expiring soon
      Inventory.countDocuments({
        status: "available",
        expiryDate: { $lte: thirtyDaysFromNow },
      }),

      // 5. Distribution status and total delivered quantity in a single aggregation
      Distribution.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            quantity: { $sum: "$quantity" },
          },
        },
      ]),

      // 6. Distribution by recipient type
      Distribution.aggregate([
        {
          $group: {
            _id: "$recipientType",
            count: { $sum: 1 },
            totalQuantity: { $sum: "$quantity" },
          },
        },
      ]),

      // 7. Monthly trends
      Medicine.aggregate([
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
      ]),

      // 8. VerificationLog decisions aggregated directly in MongoDB
      VerificationLog.aggregate([
        { $match: { stage: "decision" } },
        { $group: { _id: "$details.decision", count: { $sum: 1 } } },
      ]),
    ]);

    // Parse Medicine status counts
    let totalDonations = 0;
    let approvedDonations = 0;
    let rejectedDonations = 0;
    let pendingDonations = 0;
    let distributedDonations = 0;

    for (const stat of medicineStatusCounts) {
      totalDonations += stat.count;
      if (stat._id === "approved" || stat._id === "distributed") {
        approvedDonations += stat.count;
      }
      if (stat._id === "distributed") {
        distributedDonations += stat.count;
      }
      if (stat._id === "rejected") {
        rejectedDonations += stat.count;
      }
      if (stat._id === "pending") {
        pendingDonations += stat.count;
      }
    }

    const successRate = totalDonations > 0 ? parseFloat(((approvedDonations / totalDonations) * 100).toFixed(1)) : 0;

    // Parse Inventory stats
    const totalStock = inventoryStats.length > 0 ? inventoryStats[0].totalStock : 0;

    // Parse Distribution stats
    let totalDist = 0;
    let deliveredDist = 0;
    let pendingDist = 0;
    let inTransitDist = 0;
    let totalDeliveredQty = 0;

    for (const stat of distStatusStats) {
      totalDist += stat.count;
      if (stat._id === "delivered") {
        deliveredDist += stat.count;
        totalDeliveredQty = stat.quantity || 0;
      } else if (stat._id === "pending") {
        pendingDist += stat.count;
      } else if (stat._id === "in_transit") {
        inTransitDist += stat.count;
      }
    }

    // Impact Metrics
    const medicinesSaved = totalStock + totalDeliveredQty;
    const estimatedLivesImpacted = Math.round(totalDeliveredQty * 2.5);
    const co2SavedKg = Math.round(totalDeliveredQty * 0.5);
    const waterSavedLiters = totalDeliveredQty * 50;

    // Monthly Trends
    const monthlyTrends = monthlyTrendsRaw.map((m: { _id: { year: number; month: number }; count: number; approved: number; rejected: number }) => ({
      label: `${m._id.year}-${m._id.month.toString().padStart(2, "0")}`,
      count: m.count,
      approved: m.approved,
      rejected: m.rejected,
    }));

    // AI Performance from in-database aggregation
    let totalVerifications = 0;
    let autoApproved = 0;
    let autoRejected = 0;
    let manualReview = 0;

    for (const d of decisionStats) {
      totalVerifications += d.count;
      if (d._id === "approved") autoApproved = d.count;
      else if (d._id === "rejected") autoRejected = d.count;
      else if (d._id === "under_review") manualReview = d.count;
    }

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
