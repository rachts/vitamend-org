import connectMongoose from "@/lib/db";
import { Distribution } from "@/models/Distribution";
import { Medicine } from "@/models/Medicine";
import { User } from "@/models/User";
import type { TransparencyMetrics, TransparencyMonth } from "@/types/transparency";

const emptyMonth = (month: string): TransparencyMonth => ({ month, collected: 0, distributed: 0, pct: 0 });

export async function getTransparencyMetrics(): Promise<TransparencyMetrics> {
  await connectMongoose();
  const now = new Date();
  const year = now.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));

  const [medicineTotals, distributionTotals, clinics, monthlyCollected, monthlyDistributed] = await Promise.all([
    Medicine.aggregate<{ _id: string; total: number }>([
      { $group: { _id: "$status", total: { $sum: "$quantity" } } },
    ]),
    Distribution.aggregate<{ _id: string; total: number }>([
      { $match: { status: "delivered" } },
      { $group: { _id: "$status", total: { $sum: "$quantity" } } },
    ]),
    User.countDocuments({ role: { $in: ["ngo", "recipient"] } }),
    Medicine.aggregate<{ _id: number; total: number }>([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$quantity" } } },
    ]),
    Distribution.aggregate<{ _id: number; total: number }>([
      { $match: { status: "delivered", distributedAt: { $gte: startOfYear } } },
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
      pct: collected > 0 ? Math.min(100, Math.round((delivered / collected) * 100)) : 0,
    };
  });

  return {
    totalCollected: Array.from(byStatus.values()).reduce((sum, value) => sum + value, 0),
    totalVerified: (byStatus.get("approved") || 0) + (byStatus.get("distributed") || 0),
    totalRejected: (byStatus.get("rejected") || 0) + (byStatus.get("disposed") || 0),
    totalDistributed: distributed,
    livesImpacted: 0,
    partnerClinics: clinics,
    volunteerHours: 0,
    co2SavedKg: 0,
    months: months.length ? months : [emptyMonth(`${year}`)],
    lastUpdated: now.toISOString(),
  };
}
