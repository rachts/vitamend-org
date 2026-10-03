import connectMongoose from "@/lib/db";
import { Distribution } from "@/models/Distribution";
import { Medicine } from "@/models/Medicine";
import type { TransparencyMetrics, TransparencyMonth } from "@/types/transparency";

const emptyMonth = (month: string): TransparencyMonth => ({ month, collected: 0, distributed: 0, pct: 0 });

export async function getTransparencyMetrics(): Promise<TransparencyMetrics> {
  await connectMongoose();
  const now = new Date();
  const year = now.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year + 1, 0, 1));

  const [medicineTotals, distributionTotals, clinics, monthlyCollected, monthlyDistributed] = await Promise.all([
    Medicine.aggregate<{ _id: string; total: number }>([
      { $group: { _id: "$status", total: { $sum: "$quantity" } } },
    ]),
    Distribution.aggregate<{ _id: string; total: number }>([
      { $match: { status: "delivered" } },
      { $group: { _id: "$status", total: { $sum: "$quantity" } } },
    ]),
    Distribution.distinct("recipientId", { status: "delivered", recipientType: "hospital", recipientId: { $exists: true, $nin: [null, ""] } }),
    Medicine.aggregate<{ _id: number; total: number }>([
      { $match: { createdAt: { $gte: startOfYear, $lt: endOfYear } } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$quantity" } } },
    ]),
    Distribution.aggregate<{ _id: number; total: number }>([
      { $match: { status: "delivered", distributedAt: { $gte: startOfYear, $lt: endOfYear } } },
      { $group: { _id: { $month: "$distributedAt" }, total: { $sum: "$quantity" } } },
    ]),
  ]);

  const byStatus = new Map(medicineTotals.map((item) => [item._id, item.total || 0]));
  const distributed = distributionTotals[0]?.total || 0;
  const months = Array.from({ length: now.getUTCMonth() + 1 }, (_, index) => {
    const collected = monthlyCollected.find((item) => item._id === index + 1)?.total || 0;
    const delivered = monthlyDistributed.find((item) => item._id === index + 1)?.total || 0;
    return {
      month: new Date(Date.UTC(year, index, 1)).toLocaleString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" }),
      collected,
      distributed: delivered,
       pct: collected > 0 ? Math.round((delivered / collected) * 100) : null,
    };
  });

  return {
    totalCollected: Array.from(byStatus.values()).reduce((sum, value) => sum + value, 0),
    totalVerified: (byStatus.get("approved") || 0) + (byStatus.get("distributed") || 0),
    totalRejected: (byStatus.get("rejected") || 0) + (byStatus.get("disposed") || 0),
    totalDistributed: distributed,
    livesImpacted: null,
    partnerClinics: clinics.length,
    volunteerHours: null,
    co2SavedKg: null,
    months: months.length ? months : [emptyMonth(`${year}`)],
    lastUpdated: now.toISOString(),
  };
}
